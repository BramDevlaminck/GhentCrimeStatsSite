<template>
    <div id="pieChart">
        <div id="totalPieChart"/>
        <div id="pieChartLegendDiv">
            <svg id="pieChartLegend" height=400 width=450></svg>
        </div>
    </div>
</template>

<script>
import * as d3 from "d3";
import {color} from "d3";
// TODO: change this if needed? not really clean this way
const WIDTH = window.innerWidth / 2;
const HEIGHT = window.innerHeight / 2;
const MARGIN = 30
const radius = Math.min(800, 800) / 2 - MARGIN;
export default {
    props: {
        allFeatures: Array,
    },
    name: "TotalPieChart",
    mounted() {

        // --------------------------  legend --------------------
        const legendSvg = d3.select("#pieChartLegend");

        // --------------------------  pie chart --------------------
        const svg = d3
            .select("#totalPieChart")
            .append("svg")
            .attr("width", "50em")
            .attr("height", "50em")
            .append("g")
            .attr("transform", `translate(400, 400)`);

        const pie = d3.pie()
            .value(function (data) {
                return data[1];
            })

        const allFeatures = this.allFeatures;

        const colors = ["#a6cee3",
            "#1f78b4",
            "#b2df8a",
            "#33a02c",
            "#fb9a99",
            "#e31a1c",
            "#fdbf6f",
            "#ff7f00",
            "#cab2d6",
            "#ffff99",
            "#b15928",
            "#6a3d9a",]

        const color = d3.scaleOrdinal()
            .range(colors);

        function getYearlyData(year) {
            let totalCounts = {};
            allFeatures.forEach(obj => {
                    if (obj["year"] === year) {
                        const category = obj["fact_category"];
                        let currentCount = 0;
                        if (category in totalCounts) {
                            currentCount = totalCounts[category];
                        } else {
                            totalCounts[category] = 0;
                        }
                        totalCounts[category] = currentCount + obj["total"];
                    }
                }
            );

            let i = 1;
            for (const [key, _] of Object.entries(totalCounts)) {
                legendSvg.append("circle")
                    .attr("cx",200)
                    .attr("cy",i * 20)
                    .attr("r", 6)
                    .style("fill", colors[(i-1)%colors.length])
                legendSvg.append("text")
                    .attr("x", 220)
                    .attr("y", i * 20)
                    .text(key)
                    .style("font-size", "15px")
                    .attr("alignment-baseline","middle")
                i = i+1;
            }
            return totalCounts;
        }

        const data = pie(Object.entries(getYearlyData("2018")));

        svg.selectAll('path')
            .data(data)
            .join('path')
            .attr('d', d3.arc()
                .innerRadius(0)
                .outerRadius(radius)
            )
            .attr('fill', function (d) {
                return (color(d.data[1]))
            })
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.7);
    }
}
</script>

<style scoped>
#pieChart {
    display: flex;
    flex-flow: row wrap;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

#totalPieChart {
    width: 50em;
}
</style>