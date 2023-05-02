<script>

function preprocessDataPerYearAndMonth(data) {

    const dataEntryToYearMonth = (entry) => entry.getFullYear().toString() + "-" + (entry.getMonth() + 1).toString();

    const entriesPerYearMonthMap = new Map();
    for (const obj of data) {
        const date = new Date(obj["jaar_maand"]);
        const key = dataEntryToYearMonth(date);

        let currentCount = 0;
        if (entriesPerYearMonthMap.has(key)) {
            currentCount = entriesPerYearMonthMap.get(key);
        }
        currentCount += obj["total"];
        entriesPerYearMonthMap.set(key, currentCount);
    }

    const result = [];
    for (const [key, count] of entriesPerYearMonthMap) {
        result.push({"date": new Date(key + "-01"), "count": count, "month": new Date(key + "-01").getMonth()});
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

import * as d3 from "d3";

export default {
    props: {
        data: Array
    },
    name: "TotalLineChart",
    mounted() {
        const data = preprocessDataPerYearAndMonth(this.data);
        const monthFormatter = d3.timeFormat("%b");
        const margin = {top: 10, right: 30, bottom: 30, left: 60},
            width = 1000 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        const svg = d3.select("#lineChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .on("mouseover", mouseOverHandler)
            .on("mousemove", mouseMoveHandler)
            .on("mouseout", mouseOutHandler);
        const lineGraph = svg.append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // group the data: I want to draw one line per group
        const sumstat = d3.group(data, d => d.date.getFullYear());


        const x = d3.scaleTime()
            .domain([new Date("2021-12-31"), new Date("2022-12-01")])
            .range([0, width]);

        const xAxis = d3.axisBottom(x)
            .tickFormat(monthFormatter)
            .ticks(12);

        lineGraph.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d.count)])
            .range([height, 0]);
        lineGraph.append("g")
            .call(d3.axisLeft(y));

        // color palette
        const res = [];
        for (const year of sumstat.keys()) {
            res.push(year);
        }
        const color = d3.scaleOrdinal()
            .domain(res)
            .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999']);

        // Draw the lines
        lineGraph.selectAll(".line")
            .data(sumstat) // use grouped data for the lines!
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", (d) => color(d[0]))
            .attr("class", (d) => "year" + d[0])
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                // extract the values and sort!
                const values = d[1];
                return d3.line()
                    .curve(d3.curveMonotoneX)
                    .x(d => x(new Date(2022, d.month)))
                    .y(d => y(d.count))
                    (values);
            });

        // add the dots
        lineGraph.append("g")
            .selectAll("dot")
            .data(data) // use ungrouped data for the dots!
            .enter()
            .append("circle")
            .attr("cx", d => x(new Date(2022, d.month)))
            .attr("cy", d => y(d.count))
            .attr("r", 3)
            .style("fill", d => color(d.date.getFullYear()))
            .attr("class", d => "year" + d.date.getFullYear());


        // ------------------------- legend --------------------------
        const labels = [...sumstat.keys()];
        // Add one dot in the legend for each name.
        svg.selectAll("legendDots")
            .data(labels)
            .enter()
            .append("circle")
            .attr("class", d => "year" + d)
            .attr("cx", width + margin.left + margin.right - 300)
            .attr("cy", (d, i) => 100 + i * 25) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", d => color(d));
        // Add one label in the legend for each dot
        svg.selectAll("legendLabels")
            .data(labels)
            .enter()
            .append("text")
            .attr("class", d => "year" + d)
            .attr("x", width + margin.left + margin.right - 300 + 20)
            .attr("y", (d, i) => 100 + i * 25) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", d => color(d))
            .text(d => d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("click", function (event, data) {
                const selector = ".year" + data;
                // is the element currently visible ?
                const currentOpacity = d3.selectAll(selector).style("opacity");
                // Change the opacity: from 0 to 1 or from 1 to 0
                d3.selectAll(selector).transition().style("opacity", currentOpacity === "1" ? 0.2 : 1);

            });


        // ------------------------ hover line ---------------------------
        const hoverLine = lineGraph.append('g').classed('mouse', true).style('display', 'none');
        hoverLine.append('rect').attr('width', 2).attr('x', -1).attr('height', height).attr('fill', 'lightgray');
        hoverLine.append('text');

        // extract the current month (as integer between 0-11) from a pointer event
        function getCurrentMonthFromHover(event) {
            const [xCoordinate, _] = d3.pointer(event);
            const ratio = xCoordinate / (width + margin.left + margin.right);
            return Math.round(ratio * 12) - 1;
        }

        // show the hover tips
        function mouseOverHandler(event) {
            if (getCurrentMonthFromHover(event) >= 0) { // >= 0 needed since hovering left of the graph could also trigger the line otherwise
                hoverLine.style('display', 'block');
            }
        }

        // show the right information on hover
        function mouseMoveHandler(event) {
            const currentMonth = getCurrentMonthFromHover(event);
            if (currentMonth >= 0) { // >= 0 needed since hovering left of the graph could also trigger the line otherwise
                // select the data of this month
                const selectedMonthData = data.filter(d => d.month === currentMonth);
                // calculate the location on the x-axis
                const monthOnAxis = x(new Date(2022, currentMonth));
                // remove old labels
                hoverLine.selectAll('text')
                    .remove();
                // set new labels
                hoverLine.selectAll('text')
                    .data(selectedMonthData)
                    .enter()
                    .append('text')
                    .text(d => d.count)
                    .attr("x", (_) => 8) // place label 8 pixels to the right of the dot
                    .attr("y", d => y(d.count))
                    .attr("class", d => "year" + d.date.getFullYear())
                    .style("fill", function (d) {
                        return color(d.date.getFullYear());
                    })
                    .style("font-size", "80%")
                    .style("opacity", d => d3.select(".year" + d.date.getFullYear()).style("opacity"));

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
    <div id="lineChart"/>
</template>

<style scoped>
.grid-lines line {
    stroke: gray;
    stroke-opacity: 0.2;
}
</style>