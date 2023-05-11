<script>
import * as d3 from "d3";
import colourScales from '../ColourScales';

const {categoricalScaleColour} = colourScales();

function preprocessDataPerYearAndMonth(data, categories) {

    const dataEntryToYearMonth = (entry) => entry.getFullYear().toString() + "-" + (entry.getMonth() + 1).toString();

    const entriesPerYearMonthMap = new Map();
    for (const obj of data) {
        const date = new Date(obj["jaar_maand"]);
        const key = dataEntryToYearMonth(date);

        let currentCounts;
        if (entriesPerYearMonthMap.has(key)) {
            currentCounts = entriesPerYearMonthMap.get(key);
        } else {
            currentCounts = new Map();
            for (const category of categories) {
                currentCounts.set(category, 0);
            }
        }
        const countForThisItem = obj["total"];
        const category = obj["fact_category"];
        let totalCount = currentCounts.get("Alle Categorieën");
        let currentCrimeTypeCount = currentCounts.get(category);
        currentCounts.set("Alle Categorieën", totalCount + countForThisItem);
        currentCounts.set(category, currentCrimeTypeCount + countForThisItem);
        entriesPerYearMonthMap.set(key, currentCounts);
    }

    const result = [];
    for (const [key, crimeMap] of entriesPerYearMonthMap) {
        const dateObject = new Date(key + "-01");
        for (const [crime, count] of crimeMap) {
            result.push({"date": dateObject, "count": count, "month": dateObject.getMonth(), "fact_category": crime});
        }
    }
    // sort according to date, needed for having clean lines
    result.sort((obj1, obj2) => {
        const date1 = obj1.date;
        const date2 = obj2.date;
        if (date1 < date2) {
            return -1;
        } else if (date1 > date2) {
            return 1;
        } else {
            return 0;
        }
    });
    return result;
}

function selectCategoryFromData(data, category) {
    return data.filter(el => el["fact_category"] === category);
}

// vague function that gets the bbox of a selection and adds it to the data
function getTextBox(selection) {
    selection.each(function (d) {
        d.bbox = this.getBBox();
    });
}

export default {
    props: {
        data: Array,
        crimeTypes: Set
    },
    name: "TotalLineChart",
    mounted() {
        const allCategories = ["Alle Categorieën"].concat([...this.crimeTypes]);
        const data = preprocessDataPerYearAndMonth(this.data, allCategories);
        const monthFormatter = d3.timeFormat("%b");
        const margin = {top: 10, right: 30, bottom: 30, left: 60},
            svgWidth = Math.min(window.innerWidth, 1000) - margin.left - margin.right,
            height = Math.min(window.innerHeight / 2, 320) - margin.top - margin.bottom;
        const effectiveLineGraphWidth = svgWidth - 100;

        // append the svg object to the body of the page
        const svg = d3.select("#lineChart")
            .append("svg")
            .attr("width", svgWidth + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .on("mouseover", mouseOverHandler)
            .on("mousemove", mouseMoveHandler)
            .on("mouseout", mouseOutHandler);
        const lineGraph = svg.append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        let currentDataDisplayedBasedOnCategory = selectCategoryFromData(data, allCategories[0]); // all data of the current category!
        // group the data: I want to draw one line per group
        let groupedData = d3.group(currentDataDisplayedBasedOnCategory, d => d.date.getFullYear());

        const x = d3.scaleTime()
            .domain([new Date("2021-12-31"), new Date("2022-12-01")])
            .range([0, effectiveLineGraphWidth]);

        const xAxis = d3.axisBottom(x)
            .tickFormat(monthFormatter)
            .ticks(12);

        lineGraph.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add y-axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(currentDataDisplayedBasedOnCategory, d => +d.count)])
            .range([height, 0])
            .nice();

        const yAxis = d3.axisLeft(y);
        lineGraph.append("g")
            .attr("id", "y-axis")
            .call(yAxis);

        // y-axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 80)
            .attr("x", -margin.top - 80)
            .text("Aantal voorvallen")
            .style("font-size", "80%");

        // color palette
        const res = [];
        for (const year of groupedData.keys()) {
            res.push(year);
        }
        const color = categoricalScaleColour(res);

        // Draw the lines
        lineGraph.selectAll(".lines")
            .data(groupedData) // use grouped data for the lines!
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", (d) => color(d[0]))
            .attr("class", (d) => "lines year" + d[0]) // classes are split on " " between elements returned by the function
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                // extract the values and draw a line with it
                const [_, values] = d;
                return d3.line()
                    .curve(d3.curveMonotoneX)
                    .x(d => x(new Date(2022, d.month)))
                    .y(d => y(d.count))
                    (values);
            });

        // add the dots
        const dots = lineGraph.append("g")
            .selectAll("dot")
            .data(currentDataDisplayedBasedOnCategory) // use ungrouped data for the dots!
            .enter()
            .append("circle")
            .attr("cx", d => x(new Date(2022, d.month)))
            .attr("cy", d => y(d.count))
            .attr("r", 3)
            .style("fill", d => color(d.date.getFullYear()))
            .attr("class", d => "year" + d.date.getFullYear());


        //--------------------- dropdown ----------------------------------------

        // Function to update the chart if a new crime category is chosen
        function updateMapWithNewCrimeCategory(selectedGroup) {
            currentDataDisplayedBasedOnCategory = selectCategoryFromData(data, selectedGroup);
            groupedData = d3.group(currentDataDisplayedBasedOnCategory, d => d.date.getFullYear());

            // update y-axis (needs to happen first!)
            y.domain([0, d3.max(currentDataDisplayedBasedOnCategory, d => +d.count)])
                .nice();
            lineGraph.select("#y-axis")
                .transition()
                .duration(1000)
                .call(yAxis);

            // update the lines
            lineGraph.selectAll("path.lines")
                .data(groupedData) // use grouped data for the lines!
                .transition()
                .duration(1000)
                .attr("d", function (d) {
                    // extract the values and draw a line with it
                    const [_, values] = d;
                    return d3.line()
                        .curve(d3.curveMonotoneX)
                        .x(d => x(new Date(2022, d.month)))
                        .y(d => y(d.count))
                        (values);
                })
                .attr("fill", "none")
                .attr("stroke", (d) => color(d[0]))
                .attr("class", (d) => "lines year" + d[0]) // lines class + class right year (classes will be split on " ")
                .attr("stroke-width", 1.5);

            // update the dots
            dots.data(currentDataDisplayedBasedOnCategory) // use ungrouped data for the dots!
                .transition()
                .duration(1000)
                .attr("cx", d => x(new Date(2022, d.month)))
                .attr("cy", d => y(d.count))
                .attr("r", 3)
                .style("fill", d => color(d.date.getFullYear()))
                .attr("class", d => "year" + d.date.getFullYear());

            if (selectedGroup === "Verkeersongevallen met lichamelijk letsel") {
                // run this in promise to not block everything and first let the transition go to 0, and then hide the values
                new Promise(() => {
                    setTimeout(function () {
                        d3.selectAll(".year2018").style("opacity", 0);
                        d3.selectAll(".year2019").style("opacity", 0);
                    }, 1000);
                });
            } else {
                if (d3.selectAll(".year2018").style("opacity") === "0") {
                    d3.selectAll(".year2018").style("opacity", 1);
                    d3.selectAll(".year2019").style("opacity", 1);
                }
            }
        }

        // add the options to the button
        d3.select("#selectButtonForLineGraph")
            .selectAll('myOptions')
            .data(allCategories)
            .enter()
            .append('option')
            .text(d => d) // text showed in the menu
            .attr("value", d => d); // corresponding value returned by the button

        // Listen to dropdown
        d3.select("#selectButtonForLineGraph").on("change", function (_) {
            updateMapWithNewCrimeCategory(this.value);
        });

        // ------------------------- legend --------------------------
        const labels = [...groupedData.keys()];
        // Add one dot in the legend for each name.
        svg.selectAll("legendDots")
            .data(labels)
            .enter()
            .append("circle")
            .attr("class", d => "year" + d)
            .attr("cx", effectiveLineGraphWidth + margin.left + margin.right)
            .attr("cy", (d, i) => 100 + i * 25) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", d => color(d));
        // Add one label in the legend for each dot
        svg.selectAll("legendLabels")
            .data(labels)
            .enter()
            .append("text")
            .attr("class", d => "year" + d)
            .attr("x", effectiveLineGraphWidth + margin.left + margin.right + 20)
            .attr("y", (d, i) => 100 + i * 25) // 100 is where the first label appears. 25 is the distance between labels
            .style("fill", d => color(d))
            .text(d => d)
            .style("font-size", "90%")
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("click", function (event, data) {
                const selector = ".year" + data;
                // is the element currently visible ?
                const currentOpacity = d3.selectAll(selector).style("opacity");
                if (currentOpacity !== "0") { // ignore if the opacity is set to 0, if that is the case we want to hide the graph!
                    // Change the opacity: from 0.2 to 1 or from 1 to 0.2
                    d3.selectAll(selector).transition().style("opacity", currentOpacity === "1" ? 0.2 : 1);
                }
            });


        // ------------------------ hover line ---------------------------
        const hoverLine = lineGraph.append('g').classed('mouse', true).style('display', 'none');
        hoverLine.append('rect').attr('width', 2).attr('x', -1).attr('height', height).attr('fill', 'lightgray');
        hoverLine.append('text');

        // extract the current month (as integer between 0-11) from a pointer event
        function getCurrentMonthFromHover(event) {
            const [xCoordinate, _] = d3.pointer(event);
            const ratio = xCoordinate / (effectiveLineGraphWidth + margin.left);
            return Math.round(ratio * 12) - 1;
        }

        // show the hover tips
        function mouseOverHandler(event) {
            const monthIndex = getCurrentMonthFromHover(event);
            if (monthIndex >= 0 && monthIndex < 12) { // >= 0 needed since hovering left of the graph could also trigger the line otherwise
                hoverLine.style('display', 'block');
            }
        }

        // show the right information on hover
        function mouseMoveHandler(event) {
            const currentMonth = getCurrentMonthFromHover(event);
            if (currentMonth >= 0 && currentMonth < 12) { // >= 0 needed since hovering left of the graph could also trigger the line otherwise
                // select the data of this month
                const selectedMonthData = currentDataDisplayedBasedOnCategory.filter(d => d.month === currentMonth);
                // calculate the location on the x-axis
                const monthOnAxis = x(new Date(2022, currentMonth));
                // remove old labels and boxes
                hoverLine.selectAll('g')
                    .remove();
                // create new groups that will later contain the rectangle and text
                const labels = hoverLine.selectAll('g')
                    .data(selectedMonthData)
                    .enter()
                    .append("g");

                // draw the label
                labels.append('text')
                    .text(d => d.count)
                    .attr("x", (_) => 8) // place label 8 pixels to the right of the dot
                    .attr("y", d => y(d.count))
                    .attr("class", d => "year" + d.date.getFullYear())
                    .style("fill", function (d) {
                        return color(d.date.getFullYear());
                    })
                    .style("font-size", "80%")
                    .style("opacity", d => {
                        const line_opacity = d3.select(".year" + d.date.getFullYear()).style("opacity");
                        return line_opacity === "1" ? 1 : 0; // completely hide the label if the graph is faded
                    })
                    .call(getTextBox);

                // draw box with white background
                labels.insert("rect", "text")
                    .attr("width", d => d.bbox.width + 2) // increase a bit in size since a bit of spill is visible otherwise
                    .attr("height", d => d.bbox.height)
                    .attr("x", (_) => 8) // place label 8 pixels to the right of the dot
                    .attr("y", d => y(d.count) - d.bbox.height + 3) // do + 3 to center the rectangle height-wise
                    .style("fill", "white")
                    .style("opacity", d => {
                        const line_opacity = d3.select(".year" + d.date.getFullYear()).style("opacity");
                        return line_opacity === "1" ? 1 : 0; // completely hide the label if the graph is faded
                    });

                // set location new line
                hoverLine.attr('transform', `translate(${monthOnAxis},${0})`);
            }
        }

        // remove the hover tips
        function mouseOutHandler(_) {
            hoverLine.style('display', 'none');
        }
    }
};
</script>

<template>
  <!-- Dropdown used for all the categories -->
    <div id="chartWrapper">
        <select id="selectButtonForLineGraph"></select>
        <div id="lineChart"/>
    </div>
</template>

<style scoped>
.grid-lines line {
    stroke: gray;
    stroke-opacity: 0.2;
}
</style>