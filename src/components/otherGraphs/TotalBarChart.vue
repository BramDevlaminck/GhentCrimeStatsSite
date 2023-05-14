<template xmlns="http://www.w3.org/1999/html">
    <div id="textChartWrapper">
        <div id="text-next-to-slider">
            <h5>Corona</h5>
            <p>
                Als we naar de grafiek kijken over alle categorieën zien we een daling in de jaren van de coronacrisis.
                Zoals eerder vermeld is dit vrij logisch, mensen waren verplicht binnen te blijven in het begin van 2020 en werden daarna beperkt in hun vrijheid.
                We zien deze daling bij alle soorten <b>diefstal</b> (gewapend, fiets, ongewapend), <b>inbraken</b> in handelszaken en ook in het aantal <b>parkeerovertredingen</b>. <br>
                Het meest opvallende hier is het aantal <b> woninginbraken en zakkenrollerij </b>. Mensen werkten van thuis uit en verlieten hun woning minder. Hierdoor waren er minder opportuniteiten om in te breken.
                Ook de Gentse Feesten zijn deze jaren niet doorgegaan waardoor zakkenrollers minder succesvol waren.
                Deze cijfers zijn na corona wel grotendeels <b>terug naar hun oude niveau</b> gekomen.
            </p>
            <h5>Stijgende lijnen</h5>
            <p>
                We hebben een paar misdaden die in een stijgende lijn zitten sinds 2018.
            </p>
            <ul>
                <li>
                    <b>Bromfietsdiefstal</b>  is verdubbeld vanaf 2021 ten opzichte van 2018
                </li>
                <li>
                    Het aantal gevallen van <b>graffiti</b> is van 8 naar 13 per maand gegaan de laatste jaren
                </li>
                <li>
                    <b>Sluikstorten</b> is van ongeveer 60 maandelijkse gevallen naar meer dan 90 gevallen in 2021 en 2023 gegaan (86 in 2022)
                </li>
            </ul>
            <h5>Dalende lijnen</h5>
            <p>
                Gelukkig zien we ook een paar <b>positieve evoluties</b>,
                autodiefstal is lichtjes afgenomen (9 naar 7 feiten per maand).
                Geluidshinder daalt de afgelopen jaren standvastig met bijna 10 gevallen per maand
                en de inbraken in handelszaken zijn na corona laag gebleven in vergelijking met 2018.
                Ook motordiefstal is de laatste jaren erg beperkt met maar (afgerond) 1 voorval per maand.
            </p>
        </div>
        <div id="chartWrapper">
            <!-- Dropdown used for all the categories -->
            <select id="selectButtonTotalBarChart"></select>
            <!-- Barchart itself -->
            <div id="totalBarChart"/>
        </div>
    </div>
</template>

<script>
import * as d3 from "d3";

const margin = {top: 10, right: 30, bottom: 80, left: 60};
const WIDTH = Math.min(window.innerWidth, 800) - margin.left - margin.right;
const HEIGHT = Math.min(window.innerHeight / 2, 320) - margin.top - margin.bottom;

export default {
    name: "TotalBarChart",
    props: {
        allFeatures: Array,
        crimeTypes: Set,
    },
    mounted() {

        const allCategories = ["Alle Categorieën"].concat([...this.crimeTypes]);

        // --------------------------  create a tooltip --------------------
        const tooltip = d3.select("#totalBarChart")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("position", "absolute");

        const mouseover = function (event, d) {
            const subgroupName = d.year;
            const subgroupValue = d.total;
            tooltip
                .html("Jaar: " + subgroupName + "<br>" + "Maandelijks gemiddelde: " + subgroupValue)
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

        const svg = d3.select("#totalBarChart")
            .append("svg")
            .attr("width", WIDTH + margin.left + margin.right)
            .attr("height", HEIGHT + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.right})`);

        const allFeatures = this.allFeatures;

        const years = [...new Set(allFeatures.map(item => item["year"]))];
        const months = getNumberOfMonths();

        function getNumberOfMonths() {
            const nrOfMonths = {};
            for (const year of years) {
                nrOfMonths[year] = [...new Set(allFeatures.filter(element => {
                    return element["year"] === year;
                }).map(item => item["month"]))].length;
            }

            return nrOfMonths;
        }

        function getCategoryData(category) {
            let categoryData = allFeatures;
            if (category !== allCategories[0]) {
                categoryData = categoryData.filter(element => {
                    return element["fact_category"] === category;
                });
            }

            let counts = {};
            for (const year of years) {
                counts[year] = 0;
                months[year] = [...new Set(categoryData.filter(element => {
                    return element["year"] === year;
                }).map(item => item["month"]))].length;
            }

            categoryData.forEach(obj => {
                const year = obj["year"];
                counts[year] = counts[year] + obj["total"];
            });

            let categoryList = [];

            for (const [year, total] of Object.entries(counts)) {
                categoryList.push({year: year, total: (total / months[year]).toFixed(2)});
            }

            return categoryList;
        }

        function getMaxValue(iterable) {
            let max = Math.max(...iterable.map(obj => obj.total));
            if (max === 0) {
                max = 10;
            }
            return max;
        }

        function changeCategory(category) {
            const categoryData = getCategoryData(category);
            const max = getMaxValue(categoryData);
            // rescale x-axis
            x.domain([0, max]).nice();
            axis.transition()
                .duration(1000)
                .call(d3.axisBottom(x));

            const bars = svg.selectAll("rect").data(categoryData);

            bars.join("rect")
                .transition()
                .duration(1000)
                .attr("x", x(0))
                .attr("y", d => y(d.year))
                .attr("width", d => x(d.total))
                .attr("height", y.bandwidth())
                .attr("fill", "#31688e");
        }

        const data = getCategoryData(allCategories[0]);

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, getMaxValue(data)])
            .range([0, WIDTH])
            .nice();

        const axis = svg.append("g")
            .attr("transform", `translate(0, ${HEIGHT})`)
            .call(d3.axisBottom(x));

        // Y axis
        const y = d3.scaleBand()
            .range([0, HEIGHT])
            .domain(data.map(d => d.year))
            .padding(.1);

        svg.append("g")
            .call(d3.axisLeft(y));

        //Bars
        svg.selectAll("myRect")
            .data(data)
            .join("rect")
            .attr("x", x(0))
            .attr("y", d => y(d.year))
            .attr("width", d => x(d.total))
            .attr("height", y.bandwidth())
            .attr("fill", "#31688e")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        // x-axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("y", HEIGHT + 40)
            .attr("x", WIDTH/2 + margin.left - 10)
            .text("Maandelijks gemiddelde")
            .style("font-size", "80%");

        //--------------------- dropdown ----------------------------------------

        // add the options to the button
        d3.select("#selectButtonTotalBarChart")
            .selectAll('myOptions')
            .data(allCategories)
            .enter()
            .append('option')
            .text(function (d) {
                return d;
            }) // text showed in the menu
            .attr("value", function (d) {
                return d;
            }); // corresponding value returned by the button

        // Listen to dropdown
        d3.select("#selectButtonTotalBarChart").on("change", function (_) {
            changeCategory(this.value);
        });
    },
    beforeUnmount() {
        // remove all the data we add just before we unmount! otherwise the graphs will be duplicated
        d3.selectAll('#totalBarChart svg').remove();
    }
};
</script>

<style scoped>

</style>