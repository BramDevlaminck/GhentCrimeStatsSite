<script>
import * as d3 from "d3";
import colourScales  from '../ColourScales'
const {linearScaleColour} = colourScales();

// TODO: change this if needed? not really clean this way
const WIDTH = window.innerWidth / 2;
const HEIGHT = window.innerHeight / 2;
const HOVER_COLOR = "#d36f80";

// transform the data to the format we use for the map
function dataToMapDataFormat(data, quarterGeometryData) {
    // count how often something happened per quarter
    const totalCounts = new Map();
    for (const quarter of quarterGeometryData.keys()) {
        totalCounts.set(quarter, 0);
    }

    data.forEach(obj => {
        const properties = obj["properties"];
        const quarter = properties["quarter"];
        const currentCount = totalCounts.get(quarter);
        totalCounts.set(quarter, currentCount + properties["total"]);
    });

    // get the max this happens per quarter
    const maxCount = Math.max(...totalCounts.values());

    // create the result array in the right format and return it
    const result = [];
    for (const [quarter, total] of totalCounts) {
        result.push({
            properties: {"quarter": quarter, "count": total, "max": maxCount},
            type: "Feature",
            geometry: quarterGeometryData.get(quarter)
        });
    }
    return result;
}


export default {
    props: {
        allFeatures: Array,
        quarterGeometrySmall: Object,
        quarterGeometryData: Map,
        crimeTypes: Set
    },
    name: "TotalCrimesMap",
    mounted() {
        const allFeatures = this.allFeatures;
        const quarterGeometrySmall = this.quarterGeometrySmall;
        const crimeTypes = this.crimeTypes;
        const quarterGeometryData = this.quarterGeometryData;

        const mapSvg = d3
            .select("#totalMapContainer")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "50vh");

        const g = mapSvg.append("g");
        g.append("rect")
            .attr("width", WIDTH)
            .attr("height", HEIGHT)
            .attr(
                "transform",
                `translate(-${WIDTH},-${HEIGHT})`
            )
            .style("fill", "none")
            .style("pointer-events", "all");

        // --------------------------  create a tooltip --------------------
        const tooltip = d3.select("#mapContainer")
            .append("div")
            .style("opacity", 0)
            .style("opacity", 0)
            .attr("class", "tooltip")
            .attr("class", "tab")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("position", "absolute");

        //--------------------- dropdown ----------------------------------------

        const allCategories = ["Alle Categorieën"].concat([...this.crimeTypes]);

        // Function to update the map if a new crime category is chosen
        function updateMapWithNewCrimeCategory(selectedGroup) {
            let features = allFeatures;

            // select the data from the chart that we actually want/need
            if (selectedGroup !== allCategories[0]) {
                features = features.filter(element => {
                    return element["properties"]["fact_category"] === selectedGroup;
                });
            }

            // plot the changed map
            map.data(dataToMapDataFormat(features, quarterGeometryData))
                .attr("fill", (d, _) => {
                    const properties = d["properties"];
                    const count = properties.count;
                    const maxCount = properties.max;
                    return linearScaleColour(count, maxCount);
                });
        }

        // add the options to the button
        d3.select("#selectButtonTotalCrimes")
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
        d3.select("#selectButtonTotalCrimes").on("change", function (_) {
            updateMapWithNewCrimeCategory(this.value);
        });


        // -------------------------- effect handlers for the map -----------------
        function mouseOverHandler(event, _) {
            d3.select(this).attr("fill", HOVER_COLOR);
            tooltip.style("opacity", 1);
        }

        function mouseMoveHandler(event, data) {
            updateTooltip(event, data);
        }

        function mouseOutHandler(event, data) {
            const properties = data["properties"];
            const count = properties.count;
            const max = properties.max;
            const selectedColor = linearScaleColour(count, max);
            d3.select(this).attr("fill", selectedColor);

            tooltip.style("opacity", 0);
        }

        function clickHandler(event, data) {
            updateTooltip(event, data);
        }

        function updateTooltip(event, data) {
            const properties = data["properties"];
            const count = properties.count;
            const quarter = properties.quarter;
            tooltip
                .html("Regio: " + quarter + "<br>Aantal geregistreerde voorvallen: " + count)
                .style("left", ((event.pageX) + 20) + "px")
                .style("top", (event.pageY) + "px");
        }

        // --------------------- projection and path ----------------------------
        const projection = d3.geoMercator()
            .fitExtent([[20, 20], [WIDTH - 20, HEIGHT - 20]], quarterGeometrySmall);
        const path = d3.geoPath().projection(projection);


        // ---------------------------------- draw graph ------------------------------------
        // Draw districts and register event listeners
        const map = g.append("g")
            .selectAll("path")
            .data(dataToMapDataFormat(allFeatures, quarterGeometryData, crimeTypes))
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", (d, _) => {
                const properties = d["properties"];
                const count = properties.count;
                const max = properties.max;
                return linearScaleColour(count, max);
            })
            .attr("stroke", "#FFF")
            .attr("stroke-width", 0.5)
            .on("mouseover", mouseOverHandler)
            .on("mousemove", mouseMoveHandler)
            .on("mouseout", mouseOutHandler)
            .on("click", clickHandler);
    }
};
</script>

<template>
    <div>
        <select id="selectButtonTotalCrimes"></select>
        <div id="totalMapContainer"/>
    </div>
</template>


<style scoped>
</style>