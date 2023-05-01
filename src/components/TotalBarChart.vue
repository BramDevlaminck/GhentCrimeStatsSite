<template>
    <div>
        <!-- Dropdown used for all the categories -->
        <select id="selectButtonTotalBarChart"></select>
        <!-- Barchart itself -->
        <div id="totalBarChart"/>
    </div>
</template>

<script>
import * as d3 from "d3";

const margin = {top: 20, right: 30, bottom: 40, left: 90}
const WIDTH = window.innerWidth / 2;
const HEIGHT = window.innerHeight / 2;

export default {
    name: "TotalBarChart",
    props: {
        allFeatures: Array,
        crimeTypes: Set,
    },
    mounted() {
        // --------------------------  bar chart --------------------

        const svg = d3.select("#totalBarChart")
            .append("svg")
            .attr("width", "40em")
            .attr("height", "40em")
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.right})`);

        const allFeatures = this.allFeatures;

        function getCategoryData(category) {
            const categoryData = allFeatures.filter(element => {
                return element["fact_category"] === category;
            });

            const years = [...new Set(categoryData.map(item => item["year"]))];

            let counts = {};
            for (const year of years) {
                counts[year] = 0;
            }

            categoryData.forEach(obj => {
                const year = obj["year"];
                counts[year] = counts[year] + obj["total"];
            })

            let categoryList = [];

            for (const [year, total] of Object.entries(counts)) {
                categoryList.push({year: year, total: total});
            }

            return categoryList;
        }

        function changeCategory(category) {
            const data = getCategoryData(category);
            const bars = svg.selectAll("rect").data(data);

            bars.join("rect")
                .transition()
                .duration(1000)
                .attr("x", d => x(0))
                .attr("y", d => y(d.year))
                .attr("width", d => x(d.total))
                .attr("height", y.bandwidth())
                .attr("fill", "#69b3a2");
        }

        const data = getCategoryData("Autodiefstal");

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, 200])
            .range([ 0, WIDTH]);

        const axis = svg.append("g")
            .attr("transform", `translate(0, ${HEIGHT})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Y axis
        const y = d3.scaleBand()
            .range([ 0, HEIGHT ])
            .domain(data.map(d => d.year))
            .padding(.1);

        svg.append("g")
            .call(d3.axisLeft(y));

        //Bars
        svg.selectAll("myRect")
            .data(data)
            .join("rect")
            .attr("x", x(0) )
            .attr("y", d => y(d.year))
            .attr("width", d => x(d.total))
            .attr("height", y.bandwidth())
            .attr("fill", "#69b3a2");

        //--------------------- dropdown ----------------------------------------

        const allCategories = [...this.crimeTypes];

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
    }
}
</script>

<style scoped>

</style>