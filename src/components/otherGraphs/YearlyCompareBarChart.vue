<template>
    <div id="textChartWrapper">
        <div id="chartWrapper">
            <!-- Dropdown used for all the categories -->
            <select id="selectButtonYearlyCompareBarChart"></select>
            <!-- Barchart itself -->
            <div id="yearlyCompareBarChart"/>
        </div>
        <div id="text-next-to-slider">
            <p>
                We kunnen duidelijk zien dat het aantal parkeerovertredingen met kop en schouders boven de rest uitkomt.
                (Kleine tip: je kan deze verbergen door op de naam te klikken!)
                Op de tweede plaats komt <b>fietsdiefstal</b>, dit is ook te verwachten in een stad met 80 000 studenten
                per jaar.
                Wat daarnaast ook opvalt is dat het aantal <b>verkeersongevallen met lichamelijk letsel</b> meer
                voorkomt dan woninginbraken.
                In 2021 en 2022 is dit ook telkens de 3<sup>e</sup> categorie met de meeste voorvallen dit zijn er meer
                dan <b>1200</b> per jaar!
                (Opgelet: Voor 2018 en 2019 is deze data niet beschikbaar!)<br/>
                Verder is ook hier het effect van corona duidelijk te zien, als we 2020 bekijken ten opzichte van de
                jaren zijn bijna alle cijfers beduidend lager.
            </p>
        </div>
    </div>
</template>

<script>
import * as d3 from "d3";
import createDropdown, {configureBarChartAxis, createBarChartSvg, createText, createTooltip} from "./D3Functions";

const margin = {top: 10, right: 30, bottom: 80, left: 200};
const WIDTH = Math.min(window.innerWidth, 1000) - margin.left - margin.right;
const HEIGHT = Math.min(window.innerHeight / 2, 450) - margin.top - margin.bottom;

export default {
    name: "YearlyCompareBarChart",
    props: {
        allFeatures: Array,
        crimeTypes: Set,
    },
    mounted() {

        const allFeatures = this.allFeatures;
        const crimeTypes = this.crimeTypes;
        const years = [...new Set(allFeatures.map(item => item["year"]))];
        const data = getYearlyData(years[0]);
        const invisibleCategory = [];

        // --------------------------  create a tooltip --------------------
        const tooltip = createTooltip("#yearlyCompareBarChart");

        const mouseover = function (event, d) {
            const subgroupName = d.year;
            const subgroupValue = d.total;
            tooltip
                .html("Jaar: " + subgroupName + "<br>" + "Totaal: " + subgroupValue)
                .style("opacity", 1);
        };
        const mousemove = function (event, _) {
            tooltip.style("transform", "translateY(-55%)")
                .style("left", ((event.pageX) + 20) + "px")
                .style("top", (event.pageY) + "px");
        };
        const mouseleave = function (_, __) {
            tooltip
                .style("opacity", 0);
        };

        // --------------------------  bar chart --------------------
        const svg = createBarChartSvg("#yearlyCompareBarChart", WIDTH, HEIGHT, margin)

        function getYearlyData(year) {
            let yearly = allFeatures;
            yearly = yearly.filter(element => {
                    return element["year"] === year;
                }
            );

            let counts = {}
            for (const crime of crimeTypes) {
                counts[crime] = 0;
            }

            yearly.forEach(obj => {
                const category = obj["fact_category"];
                counts[category] = counts[category] + obj["total"];
            });

            let yearlyList = [];
            for (const [category, total] of Object.entries(counts)) {
                yearlyList.push({category: category, total: total, year: year});
            }

            yearlyList.sort((a, b) => a.total - b.total);

            return yearlyList;
        }

        function getMaxValue(iterable) {
            let max = Math.max(...iterable.map(obj => {
                if (invisibleCategory.includes(obj.category)) {
                    return 0;
                } else {
                    return obj.total;
                }
            }));
            if (max === 0) {
                max = 10;
            }
            return max;
        }

        function changeYear(year, yearlyData) {
            const max = getMaxValue(yearlyData);
            // rescale x-axis
            x.domain([0, max]).nice();
            xAxis.transition()
                .duration(1000)
                .call(d3.axisBottom(x));

            y.domain(yearlyData.map(d => d.category));
            yAxis.transition()
                .duration(1000)
                .call(d3.axisLeft(y));

            yAxis.selectAll('.tick').on("click", function (_, d) {
                clickHandler(year, yearlyData, d);
            });

            const bars = svg.selectAll("rect").data(yearlyData);

            bars.join("rect")
                .transition()
                .duration(1000)
                .attr("x", x(0))
                .attr("y", d => y(d.category))
                .attr("width", d => x(d.total))
                .attr("height", y.bandwidth())
                .attr("fill", "#31688e")
                .style("opacity", d => {
                    if (invisibleCategory.includes(d.category)) {
                        return 0.2;
                    } else {
                        return 1;
                    }
                });
        }

        // Add x- and y-axis
        const {
            x,
            xAxis,
            y,
            yAxis
        } = configureBarChartAxis(svg, WIDTH, HEIGHT, [0, getMaxValue(data)], data.map(d => d.category))

        yAxis.selectAll('.tick').style("cursor", "pointer").on("click", function (_, d) {
            clickHandler(years[0], data, d);
        });

        //Bars
        svg.selectAll("myRect")
            .data(data)
            .join("rect")
            .attr("x", x(0))
            .attr("y", d => y(d.category))
            .attr("width", d => x(d.total))
            .attr("height", y.bandwidth())
            .attr("fill", "#31688e")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        // x-axis label:
        createText(svg, HEIGHT + 40, WIDTH / 2 + 40, "Totaal aantal voorvallen");

        function clickHandler(year, yearlyData, selectData) {
            if (invisibleCategory.includes(selectData)) {
                invisibleCategory.splice(invisibleCategory.indexOf(selectData));
            } else {
                invisibleCategory.push(selectData);
            }
            changeYear(year, yearlyData);
        }

        //--------------------- dropdown ----------------------------------------

        createDropdown("#selectButtonYearlyCompareBarChart", years, (year) => {
            changeYear(year, getYearlyData(year))
        })

    },
    beforeUnmount() {
        // remove all the data we add just before we unmount! otherwise the graphs will be duplicated
        d3.selectAll('#yearlyCompareBarChart svg').remove();
        d3.selectAll('#selectButtonYearlyCompareBarChart option').remove();
    }
}
</script>

<style scoped>

</style>