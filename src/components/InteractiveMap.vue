<script>
import * as d3 from "d3";
import BikeMap from "@/components/BikeMap.vue";
import TotalCrimesMap from "@/components/TotalCrimesMap.vue";
import SecondairyNavBar from "@/components/SecondaryNavBar.vue";
// TODO: change this if needed? not really clean this way
const WIDTH = window.innerWidth / 2;
const HEIGHT = window.innerHeight / 2;
const HOVER_COLOR = "#d36f80";


// function to get a colour given the count in this quarter and the max count across all quarters
function getColour(count, maxCount) {
    const color = ["#f7fbff", "#f6faff", "#f5fafe", "#f5f9fe", "#f4f9fe", "#f3f8fe", "#f2f8fd", "#f2f7fd", "#f1f7fd", "#f0f6fd", "#eff6fc", "#eef5fc", "#eef5fc", "#edf4fc", "#ecf4fb", "#ebf3fb", "#eaf3fb", "#eaf2fb", "#e9f2fa", "#e8f1fa", "#e7f1fa", "#e7f0fa", "#e6f0f9", "#e5eff9", "#e4eff9", "#e3eef9", "#e3eef8", "#e2edf8", "#e1edf8", "#e0ecf8", "#e0ecf7", "#dfebf7", "#deebf7", "#ddeaf7", "#ddeaf6", "#dce9f6", "#dbe9f6", "#dae8f6", "#d9e8f5", "#d9e7f5", "#d8e7f5", "#d7e6f5", "#d6e6f4", "#d6e5f4", "#d5e5f4", "#d4e4f4", "#d3e4f3", "#d2e3f3", "#d2e3f3", "#d1e2f3", "#d0e2f2", "#cfe1f2", "#cee1f2", "#cde0f1", "#cce0f1", "#ccdff1", "#cbdff1", "#cadef0", "#c9def0", "#c8ddf0", "#c7ddef", "#c6dcef", "#c5dcef", "#c4dbee", "#c3dbee", "#c2daee", "#c1daed", "#c0d9ed", "#bfd9ec", "#bed8ec", "#bdd8ec", "#bcd7eb", "#bbd7eb", "#b9d6eb", "#b8d5ea", "#b7d5ea", "#b6d4e9", "#b5d4e9", "#b4d3e9", "#b2d3e8", "#b1d2e8", "#b0d1e7", "#afd1e7", "#add0e7", "#acd0e6", "#abcfe6", "#a9cfe5", "#a8cee5", "#a7cde5", "#a5cde4", "#a4cce4", "#a3cbe3", "#a1cbe3", "#a0cae3", "#9ec9e2", "#9dc9e2", "#9cc8e1", "#9ac7e1", "#99c6e1", "#97c6e0", "#96c5e0", "#94c4df", "#93c3df", "#91c3df", "#90c2de", "#8ec1de", "#8dc0de", "#8bc0dd", "#8abfdd", "#88bedc", "#87bddc", "#85bcdc", "#84bbdb", "#82bbdb", "#81badb", "#7fb9da", "#7eb8da", "#7cb7d9", "#7bb6d9", "#79b5d9", "#78b5d8", "#76b4d8", "#75b3d7", "#73b2d7", "#72b1d7", "#70b0d6", "#6fafd6", "#6daed5", "#6caed5", "#6badd5", "#69acd4", "#68abd4", "#66aad3", "#65a9d3", "#63a8d2", "#62a7d2", "#61a7d1", "#5fa6d1", "#5ea5d0", "#5da4d0", "#5ba3d0", "#5aa2cf", "#59a1cf", "#57a0ce", "#569fce", "#559ecd", "#549ecd", "#529dcc", "#519ccc", "#509bcb", "#4f9acb", "#4d99ca", "#4c98ca", "#4b97c9", "#4a96c9", "#4895c8", "#4794c8", "#4693c7", "#4592c7", "#4492c6", "#4391c6", "#4190c5", "#408fc4", "#3f8ec4", "#3e8dc3", "#3d8cc3", "#3c8bc2", "#3b8ac2", "#3a89c1", "#3988c1", "#3787c0", "#3686c0", "#3585bf", "#3484bf", "#3383be", "#3282bd", "#3181bd", "#3080bc", "#2f7fbc", "#2e7ebb", "#2d7dbb", "#2c7cba", "#2b7bb9", "#2a7ab9", "#2979b8", "#2878b8", "#2777b7", "#2676b6", "#2574b6", "#2473b5", "#2372b4", "#2371b4", "#2270b3", "#216fb3", "#206eb2", "#1f6db1", "#1e6cb0", "#1d6bb0", "#1c6aaf", "#1c69ae", "#1b68ae", "#1a67ad", "#1966ac", "#1865ab", "#1864aa", "#1763aa", "#1662a9", "#1561a8", "#1560a7", "#145fa6", "#135ea5", "#135da4", "#125ca4", "#115ba3", "#115aa2", "#1059a1", "#1058a0", "#0f579f", "#0e569e", "#0e559d", "#0e549c", "#0d539a", "#0d5299", "#0c5198", "#0c5097", "#0b4f96", "#0b4e95", "#0b4d93", "#0b4c92", "#0a4b91", "#0a4a90", "#0a498e", "#0a488d", "#09478c", "#09468a", "#094589", "#094487", "#094386", "#094285", "#094183", "#084082", "#083e80", "#083d7f", "#083c7d", "#083b7c", "#083a7a", "#083979", "#083877", "#083776", "#083674", "#083573", "#083471", "#083370", "#08326e", "#08316d", "#08306b"];
    // edge case since we don't want everything dark if there just is no data for it
    if (maxCount === 0) {
        return color[0];
    }

    return color[Math.round(count / maxCount * color.length)];
}

function filterDataBasedOnDateString(date, data) {
    return data.filter(entry => entry["properties"]["jaar_maand"] === date);
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
    components: {SecondairyNavBar, TotalCrimesMap, BikeMap},
    props: {
        allFeatures: Array,
        beginDate: Date,
        endDate: Date,
        crimeTypes: Set,
        quarterGeometryData: Map,
        bikeParkingPerQuarter: Map,
    },
    data() {
        // get the data but without the data that belongs to an unknown quarter
        const quarterGeometryDataWithoutUnknown = new Map();
        for (const [quarter, data] of this.quarterGeometryData) {
            if (quarter !== "Onbekend") {
                quarterGeometryDataWithoutUnknown.set(quarter, data);
            }
        }

        const quarterGeometrySmall = {
            type: "FeatureCollection",
            features: [...quarterGeometryDataWithoutUnknown.values()].map(value => {
                return {
                    geometry: value
                };
            })
        };
        return {
            allFeaturesWithoutUnknown: this.allFeatures.filter(entry => entry["properties"]["quarter"] !== "Onbekend"),
            quarterGeometryDataWithoutUnknown: quarterGeometryDataWithoutUnknown,
            quarterGeometrySmall: quarterGeometrySmall
        }
    },
    name: "InteractiveMap",
    mounted() {
        const mapSvg = d3
            .select("#mapContainer")
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
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("position", "absolute");


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
            const maxCount = properties.max;
            const selectedColor = getColour(count, maxCount);
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
        const allFeaturesWithoutUnknown = this.allFeaturesWithoutUnknown;
        const quarterGeometrySmall = this.quarterGeometrySmall;
        const quarterGeometryDataWithoutUnknown = this.quarterGeometryDataWithoutUnknown

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
                return getColour(count, maxCount);
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
                    return getColour(count, maxCount);
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
        const width = 960 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

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
            .attr("transform", "translate(" + margin.left + "," + height / 5 + ")");

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
                    return getColour(count, maxCount);
                });
        }

    }
};
</script>

<template>
    <div>
        <!-- Dropdown used for all the categories -->
        <select id="selectButton"></select>
        <!-- container where the map, tooltip and slider itself will be placed -->
        <div id="mapContainer"/>
        <!-- div where we will place the slider -->
        <div id="sliderDiv"/>
        <!-- button to play/pause the slider -->
        <button id="playButton">Play</button>
    </div>
    <BikeMap :all-features="allFeaturesWithoutUnknown" :quarter-geometry-small="quarterGeometrySmall" :bike-parking-per-quarter="bikeParkingPerQuarter" :quarter-geometry-data="quarterGeometryDataWithoutUnknown" />
    <TotalCrimesMap :all-features="allFeaturesWithoutUnknown" :quarter-geometry-small="quarterGeometrySmall" :quarter-geometry-data="quarterGeometryDataWithoutUnknown" :crime-types="crimeTypes" />
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