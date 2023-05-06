<script>
import * as d3 from "d3";
import BikeMap from "@/components/maps/BikeMap.vue";
import TotalCrimesMap from "@/components/maps/TotalCrimesMap.vue";
import colourScales  from '../ColourScales'
const {linearScaleColour} = colourScales();

// TODO: change this if needed? not really clean this way
const WIDTH = window.innerWidth / 2;
const HEIGHT = window.innerHeight / 2;
const HOVER_COLOR = "#d36f80";

function filterDataBasedOnDateString(date, data) {
    return data.filter(entry => entry["properties"]["jaar_maand"] === date);
}

function filterDataBasedOnYearString(year, data) {
    return data.filter(entry => entry["properties"]["year"] === year);
}

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
    components: {TotalCrimesMap, BikeMap},
    props: {
        allFeatures: Array,
        beginDate: Date,
        endDate: Date,
        crimeTypes: Set,
        quarterGeometryData: Map,
        bikeParkingPerQuarter: Map,
        quarterGeometryDataWithoutUnknown: Map,
        quarterGeometrySmall: Object
    },
    name: "InteractiveMap",
    mounted() {
        const mapSvg = d3
            .select("#mapContainer")
            .append("svg")
            .attr("width", "50vw")
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
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("position", "absolute");


        // -------------------------- effect handlers for the map tooltip -----------------
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
            const maxCount = properties.max;
            const selectedColor = linearScaleColour(count, maxCount);
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

        const beginDate = new Date(this.beginDate);
        const endDate = new Date(this.endDate);
        const allFeaturesWithoutUnknown = this.allFeatures;
        const quarterGeometrySmall = this.quarterGeometrySmall;
        const quarterGeometryDataWithoutUnknown = this.quarterGeometryDataWithoutUnknown;

        // --------------------- projection and path ----------------------------
        const projection = d3.geoMercator()
            .fitExtent([[20, 20], [WIDTH - 20, HEIGHT - 20]], quarterGeometrySmall);
        const path = d3.geoPath().projection(projection);


        let currentDateString = dateObjectToYearMonthDay(beginDate);

        // ---------------------------------- draw graph ------------------------------------
        // Draw districts and register event listeners
        const map = g.append("g")
            .selectAll("path")
            .data(dataToMapDataFormat(filterDataBasedOnDateString(currentDateString, allFeaturesWithoutUnknown), quarterGeometryDataWithoutUnknown))
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", (d, _) => {
                const properties = d["properties"];
                const count = properties.count;
                const maxCount = properties.max;
                return linearScaleColour(count, maxCount);
            })
            .attr("stroke", "#FFF")
            .attr("stroke-width", 0.5)
            .on("mouseover", mouseOverHandler)
            .on("mousemove", mouseMoveHandler)
            .on("mouseout", mouseOutHandler)
            .on("click", clickHandler);

        //--------------------- dropdown ----------------------------------------

        const allCategories = ["Alle Categorieën"].concat([...this.crimeTypes]);
        let currentDataDisplayedBasedOnCategory = allFeaturesWithoutUnknown; // all data of the current category!
        // Function to update the map if a new crime category is chosen
        function updateMapWithNewCrimeCategory(selectedGroup) {
            let features = allFeaturesWithoutUnknown;

            // select the data from the chart that we actually want/need
            if (selectedGroup !== allCategories[0]) {
                features = features.filter(element => {
                    return element["properties"]["fact_category"] === selectedGroup;
                });
            }

            currentDataDisplayedBasedOnCategory = features;

            // filter the data based on date
            const dataFilteredOnDate = filterDataBasedOnDateString(currentDateString, currentDataDisplayedBasedOnCategory);

            // plot the changed map
            map.data(dataToMapDataFormat(dataFilteredOnDate, quarterGeometryDataWithoutUnknown))
                .attr("fill", (d, _) => {
                    const properties = d["properties"];
                    const count = properties.count;
                    const maxCount = properties.max;
                    return linearScaleColour(count, maxCount);
                });
        }

        // add the options to the button
        d3.select("#selectButton")
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
        d3.select("#selectButton").on("change", function (_) {
            updateMapWithNewCrimeCategory(this.value);
        });

        // ----------------------------- slider ------------------------------

        // translate date object to YYYY-MM-DD string
        function dateObjectToYearMonthDay(date) {
            return date.toISOString().split('T')[0];
        }

        // function to format data in d3
        const formatDateIntoYear = d3.timeFormat("%Y");
        const formatDate = d3.timeFormat("%b %Y");

        const margin = {top: 50, right: 50, bottom: 0, left: 50};
        const width = WIDTH - margin.left - margin.right;
        const height = HEIGHT - margin.top - margin.bottom;

        let sliderIsMoving = false;
        let xPositionOnSlider = 0;
        const maxXPositionOnSlider = width;

        const playButton = d3.select("#playButton");

        // gives the position on the sliders as an x-value
        const positionOnSliderObject = d3.scaleTime()
            .domain([beginDate, endDate])
            .range([0, maxXPositionOnSlider])
            .clamp(true);

        // create the slider
        const sliderSvg = d3.select("#sliderDiv")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%");

        const slider = sliderSvg
            .append("g")
            .attr("class", "slider")
            .attr("transform", "translate(" + margin.left + "," + height / 10 + ")");

        // add all the features to the slider
        slider.append("line")
            .attr("class", "track")
            .attr("x1", positionOnSliderObject.range()[0])
            .attr("x2", positionOnSliderObject.range()[1])
            .select(function () {
                return this.parentNode.appendChild(this.cloneNode(true));
            })
            .attr("class", "track-inset")
            .select(function () {
                return this.parentNode.appendChild(this.cloneNode(true));
            })
            .attr("class", "track-overlay")
            .call(d3.drag()
                .on("start.interrupt", (_) => {
                    slider.interrupt();
                })
                .on("start drag", (event) => {
                    xPositionOnSlider = event.x;
                    updateSlider(positionOnSliderObject.invert(xPositionOnSlider));
                })
            );

        slider.insert("g", ".track-overlay")
            .attr("class", "ticks")
            .attr("transform", "translate(0," + 18 + ")")
            .selectAll("text")
            .data(positionOnSliderObject.ticks(10))
            .enter()
            .append("text")
            .attr("x", positionOnSliderObject)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .text(function (d) {
                return formatDateIntoYear(d);
            });

        let timer; // timer we will use to check if slider already needs to move or not
        playButton
            .on("click", function () {
                const button = d3.select(this);
                if (button.text() === "Pause") {  // TODO: maybe don't use the "pause" text to check which state we are in, use some class?
                    sliderIsMoving = false;
                    clearInterval(timer);
                    button.text("Play");
                } else {
                    sliderIsMoving = true;
                    // wait 1/4 sec before going to the next step
                    timer = setInterval(stepOnSlider, 250);
                    button.text("Pause");
                }
            });

        // execute 1 step on the slider
        function stepOnSlider() {
            // invert creates the date from the current x position on the slider
            updateSlider(positionOnSliderObject.invert(xPositionOnSlider));
            xPositionOnSlider = xPositionOnSlider + (maxXPositionOnSlider / 151);
            if (xPositionOnSlider > maxXPositionOnSlider) {
                sliderIsMoving = false;
                xPositionOnSlider = 0;
                clearInterval(timer);
                playButton.text("Play");
            }
        }

        const sliderHandle = slider.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("r", 9);

        const sliderLabel = slider.append("text")
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .text(formatDate(beginDate))
            .attr("transform", "translate(0," + (-25) + ")");

        // this function is called every time the position of the slider changes, here we update the data
        function updateSlider(date) {
            // TODO: if the tooltip is shown, this should also be updated when we have a change here
            // update position and text of label according to slider scale
            sliderHandle.attr("cx", positionOnSliderObject(date));
            sliderLabel
                .attr("x", positionOnSliderObject(date))
                .text(formatDate(date));

            const year = date.getUTCFullYear();
            const month = date.getUTCMonth() + 1; // +1 since months start at 0 in the date object

            const format_month = (month) => {
                if (month < 10) {
                    return "0" + month.toString();
                }
                return month.toString();
            };

            // TODO: only replace currentDateString if it is different, and only then we should refilter and redraw everything (perhaps also looking if the crime category changed?)
            currentDateString = year + "-" + format_month(month) + "-01"; // this is the format of the "jaar_maand"-field in the dataset
            const dataToShow = filterDataBasedOnDateString(currentDateString, currentDataDisplayedBasedOnCategory);

            map.data(dataToMapDataFormat(dataToShow, quarterGeometryDataWithoutUnknown))
                .attr("fill", (d, _) => {
                    const properties = d["properties"];
                    const count = properties.count;
                    const maxCount = properties.max;
                    return linearScaleColour(count, maxCount);
                });
        }

    }
};
</script>

<template>
    <div id="chartWrapper">
        <!-- Dropdown used for all the categories -->
        <select id="selectButton"></select>
        <!-- container where the map, tooltip and slider itself will be placed -->
        <div id="mapContainer"/>
        <!-- div where we will place the slider -->
        <div id="sliderDiv"/>
        <!-- button to play/pause the slider -->
        <button id="playButton">Play</button>
    </div>
</template>

<style scoped>

#playButton {
    top: 140px;
    left: 50px;
    background: #f08080;
    border-radius: 3px;
    border: none;
    color: white;
    margin: 0;
    padding: 0 12px;
    width: 60px;
    cursor: pointer;
    height: 30px;
}

#playButton:hover {
    background-color: #696969;
}

#sliderDiv {
    width: 50vw;
}

/*use deep selector to select things dynamically added by d3 in this component, see discussion here: https://github.com/vuejs/vue-loader/issues/559*/
#sliderDiv:deep(.ticks) {
    font-size: 10px;
}

#sliderDiv:deep(.track,
.track-inset,
.track-overlay) {
    stroke-linecap: round;
}

#sliderDiv:deep(.track) {
    stroke: #000;
    stroke-opacity: 0.3;
    stroke-width: 10px;
}

#sliderDiv:deep(.track-inset) {
    stroke: #dcdcdc;
    stroke-width: 8px;
}

#sliderDiv:deep(.track-overlay) {
    pointer-events: stroke;
    stroke-width: 50px;
    stroke: transparent;
    cursor: grab;
}

#sliderDiv:deep(.handle) {
    fill: #fff;
    stroke: #000;
    stroke-opacity: 0.5;
    stroke-width: 1px;
}
</style>