<script>
//TODO:!https://fonts.googleapis.com/css?family=Special+Elite apply this font in some places?
import * as d3 from "d3";
import BikeMap from "@/components/maps/BikeMap.vue";
import TotalCrimesMap from "@/components/maps/TotalCrimesMap.vue";
import { max } from "d3";
import colourScales from '../ColourScales'
import { NO } from "@vue/shared";
// import '../../assets/patterns.css'
const { linearScaleColour } = colourScales();

// TODO: change this if needed? not really clean this way
const WIDTH = window.innerWidth / 2;
const HEIGHT = window.innerHeight / 2;
const HOVER_COLOR = "#db5252";
const NO_DATA_COLOR = "#f08080"

function filterDataBasedOnDateString(date, data) {
    return data.filter(entry => entry["properties"]["jaar_maand"] === date);
}

// ------ Year functions  ------
function roundtoYear(x) {
    const xYear = x.getFullYear();
    let yearms = 1000 * 60 * 60 * 24;
    //leapyear
    if (xYear % 4 === 0 && xYear % 100 !== 0) {
        yearms *= 366;
    } else {
        yearms *= 365;
    }
    const halfyearms = yearms / 2

    return new Date(new Date(x.valueOf() + halfyearms).getUTCFullYear(), 0, 1);
}

function toNextRoundYear(x) {
    const nextYear = (+x) + 1;

    return new Date(nextYear, 0, 1);
}

function filterDataBasedOnYearString(year, data) {
    return data.filter(entry => entry["properties"]["year"] === year);
}

function getUniqueYears(data) {
    let years = data.map(obj => obj.properties.year);
    let uniqueYears = years.filter((year, index, self) => self.indexOf(year) === index);
    return uniqueYears;
}

function yearArrayToDateArray(years) {
    return years.map(year => new Date(year));
}

function constructCountsPerYear(data, quarterGeometryData) {
    // count how often something happened per quarter
    const yearCounts = new Map();

    const years = getUniqueYears(data);
    for (const year of years) {
        const quarterCounts = new Map();

        for (const quarter of quarterGeometryData.keys()) {
            quarterCounts.set(quarter, new Map());
            yearCounts.set(year, quarterCounts);
        }
    }

    // yearCounts should have the following structure:
    /* Map (year, Map(quarter, Map(month, total)))
     */

    data.forEach(obj => {
        const properties = obj["properties"];
        const quarter = properties["quarter"];
        const month = properties["month"];
        const year = properties["year"];

        const currentCountMap = yearCounts.get(year);


        const currentMonthCount = currentCountMap.get(quarter);
        if (currentMonthCount.has(month)) {
            currentMonthCount.set(month, currentMonthCount.get(month) + properties["total"]);
        } else {
            currentMonthCount.set(month, properties['total']);
        }
        currentCountMap.set(quarter, currentMonthCount);
        yearCounts.set(year, currentCountMap);
    });
    return yearCounts;
}

function constructAvgsFromCounts(yearCounts) {
    const yearAverages = new Map();

    for (const [year, quarters] of yearCounts) {
        yearAverages.set(year, new Map());
        const quarterAvgs = yearAverages.get(year);
        // Iterate over each month's count for the current neighborhood
        for (const [quarter, months] of quarters) {
            let total = 0;
            for (const [month, count] of months) {
                total += count;
            }
            // Calculate the monthly average for the current neighborhood
            const average = total / months.size;

            // Add the average to the new Map
            quarterAvgs.set(quarter, average);
        }
        yearAverages.set(year, quarterAvgs);

    }
    return yearAverages;
}

function constructTotalYearAvgs(yearAvgs) {
    let totalAvgs = new Map();
    for (const [year, quarters] of yearAvgs) {
        let totalAvg = 0;
        for (const [quarter, avg] of quarters) {
            totalAvg += avg;
        }
        totalAvgs.set(year, totalAvg);
    }
    return totalAvgs;

}

function getAllYearExtrema(yearAvgs) {
    // count how often something happened per quarter

    const maxAvgPerYear = new Map();
    for (const [year, quarters] of yearAvgs) {
        const maxAvg = Math.max(...quarters.values());
        maxAvgPerYear.set(year, maxAvg);
    }

    return [Math.max(...maxAvgPerYear.values()), Math.min(...maxAvgPerYear.values())];
}

// ------ Data processing  ------
function dataToMapDataFormat(yearAvgs, quarterGeometryData, maxAvg, year = "2018") {
    // count how often something happened per quarter
    const currentYearAvgs = yearAvgs.get(year);

    // create the result array in the right format and return it
    const result = [];
    for (const [quarter, avg] of currentYearAvgs) {
        result.push({
            properties: { "quarter": quarter, "count": avg, "max": maxAvg },
            type: "Feature",
            geometry: quarterGeometryData.get(quarter)
        });
    }
    return result;
}


export default {
    components: { TotalCrimesMap, BikeMap },
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

        // -------- global variable definition ---------
        // DATES
        const beginDate = new Date(this.beginDate);
        const endDate = new Date(this.endDate);
        const beginYear = dateToYearString(beginDate);
        const endYear = dateToYearString(endDate);

        let currentYear = beginYear;

        // DATA
        const allFeaturesWithoutUnknown = this.allFeatures;
        const quarterGeometrySmall = this.quarterGeometrySmall;
        const quarterGeometryDataWithoutUnknown = this.quarterGeometryDataWithoutUnknown;

        let yearAverages = constructAvgsFromCounts(constructCountsPerYear(allFeaturesWithoutUnknown, quarterGeometryDataWithoutUnknown));
        // initial maxAvg value ( for default values: 2018, All categories) to be used in colour scale legend
        let maxAvg = getAllYearExtrema(yearAverages)[0];
        let totalAverages = Array.from(constructTotalYearAvgs(yearAverages), ([year, value]) => ({ year, value }));

        //------ MAP  ------
        //create an SVG in the map container, and keep a reference to it
        const mapSvg = d3
            .select("#mapContainer")
            .append("svg")
            .attr("width", "50vw")
            .attr("height", "50vh");

        // VIEW
        const mapcontainerclient = mapSvg.node().getBoundingClientRect(); //to get component width as rendered on the client 


        // create a group of SVG elements inside mapSVG
        const g = mapSvg.append("g");

        // ------  Tooltip -------
        // tooltip is a little box that will contain information on a part of the map
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


        // -------- effect handlers for the map tooltip ---------
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
            const totalAvginYear = totalAverages[currentYear - 2018];

            if (totalAvginYear.value > 0) {
                const selectedColor = linearScaleColour(count, maxCount);
                d3.select(this).attr("fill", selectedColor);
            } else {
                const selectedColor = NO_DATA_COLOR;
                d3.select(this).attr("fill", selectedColor);
            }

            tooltip.style("opacity", 0);
        }

        function clickHandler(event, data) {
            updateTooltip(event, data);
        }

        function updateTooltip(event, data) {
            const properties = data["properties"];
            const count = properties.count;
            const quarter = properties.quarter;
            const totalAvginYear = totalAverages[currentYear - beginYear];

            if (totalAvginYear.value > 0) {
                tooltip
                    .html("Regio: " + quarter + "<br>Maandelijks gemiddeld aantal voorvallen in " + currentYear + " : " + (Math.round(count * 100) / 100).toFixed(2))
                    .style("left", ((event.pageX) + 20) + "px")
                    .style("top", (event.pageY) + "px");
            } else {
                tooltip
                    .html("Regio: " + quarter + "<br>Geen data voor het jaar " + currentYear)
                    .style("left", ((event.pageX) + 20) + "px")
                    .style("top", (event.pageY) + "px");
            }
        }


        // ------- MAP:projection and path ---------
        // TODO: fix width references
        const projection = d3.geoMercator()
            .fitExtent([[20, 20], [mapcontainerclient.width - 20, mapcontainerclient.height - 20]], quarterGeometrySmall);
        const mapPath = d3.geoPath().projection(projection);

        // --------- MAP:draw graph -----------
        // Draw districts and register event listeners
        const map = g.append("g")
            .selectAll("path")
            .data(dataToMapDataFormat(yearAverages, quarterGeometryDataWithoutUnknown, maxAvg, currentYear))
            .enter()
            .append("path")
            .attr("d", mapPath)
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

        //----------- dropdown --------------
        const allCategories = ["Alle Categorieën"].concat([...this.crimeTypes]);
        let currentDataDisplayedBasedOnCategory = allFeaturesWithoutUnknown; // all data of the current category!
        // Function to update the map if a new crime category is chosen

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

        //translate date obj to Year string (e.g: "2018")
        function dateToYearString(date) {
            return date.getFullYear().toString();
        }

        // function to format data in d3
        const formatDateIntoYear = d3.timeFormat("%Y");
        const formatDate = d3.timeFormat("%b %Y");

        // TODO
        const margin = { top: 50, right: 50, bottom: 0, left: 50 };
        const width = WIDTH - margin.left - margin.right;
        const height = HEIGHT - margin.top - margin.bottom;

        // const sliderWidth = 
        const sliderHandleWidth = 12;
        const sliderLeftPadding = 40;
        const sliderTopPadding = 7.5;
        const sliderBottomPadding = 25;

        const heightSlider = 300

        let sliderIsMoving = false;

        const maxXPositionOnSlider = mapcontainerclient.width;

        const playButton = d3.select("#playButton");

        // gives the position on the sliders as an x-value
        const xScale = d3.scaleTime()
            .domain([new Date(Date.UTC(parseInt(beginYear), 0, 0, 0, 0, 0)), new Date(endYear)])
            .range([sliderLeftPadding, maxXPositionOnSlider])
            .clamp(true)

        let xPositionOnSlider = xScale(roundtoYear(xScale.invert(0)));

        // create the slider
        const sliderSvg = d3.select("#sliderDiv")
            .append("svg")
            .attr("id", "slider-svg")
            .attr("width", mapcontainerclient.width + 40)
            .attr("height", 90);
        const slidercontainerclient = sliderSvg.node().getBoundingClientRect();

        //linear value scale for the slider line chart   
        const yScale = d3.scaleLinear()
            .domain([0, Math.max(...totalAverages.map(obj => obj.value))])
            .range([slidercontainerclient.height - sliderBottomPadding, sliderTopPadding])
            .nice();

        const xAxis = d3.axisBottom(xScale);
        xAxis.ticks((+endYear) - (+beginYear) + 1, "%Y");

        const yAxis = d3.axisLeft(yScale);
        yAxis.ticks(3);

        sliderSvg.append("g")
            .attr("class", "xAxis-slider")
            .attr("transform", `translate(0, ${slidercontainerclient.height - 25})`)
            .call(xAxis);

        const yAxisg = sliderSvg.append("g")
            .attr("class", "yAxis-slider")
            .attr("transform", `translate(${sliderLeftPadding}, 0)`)
            .call(yAxis);

        yAxisg
            .style('cursor', 'alias')
            .append('title')
            .text("Totaal Maandelijkse Gemiddelde\n(som van de gemiddelden over heel gent)");

        // drag behavior functions
        function dragmove(e) {
            var handle = d3.select(this);
            handle.style("cursor", "grabbing")
                .style("fill", "#3c73d7");
            var handlew = +handle.attr("width");

            var rootx = +sliderSvg.attr("x");
            var rootw = +sliderSvg.attr("width");

            var computedx = Math.max(0, Math.min(rootw - handlew - 20, e.x))

            handle.attr("x", computedx);
        }

        function dragend(e) {
            let handle = d3.select(this);
            handle.style("cursor", "grab")
                .style("fill", "cornflowerblue");
            let handlex = +handle.attr("x");
            let handlew = +handle.attr("width");
            let handlemidx = handlex + (handlew / 2);

            let xYear = xScale.invert(handlemidx);
            let snappedx = roundtoYear(xYear);

            updateSlider(snappedx);
        }

        const drag = d3.drag()
            .on("drag", dragmove)
            .on("end", dragend);

        const handle = sliderSvg.append('rect')
            .attr("id", "slider-handle")
            .attr("x", xPositionOnSlider - sliderHandleWidth / 2)
            .attr("y", 0)
            .attr("width", sliderHandleWidth)
            .attr("height", function () {
                return sliderSvg.attr("height") - 25;
            })
            .style("fill", 'cornflowerblue')
            .style("cursor", "grab")
            .style("opacity", 0.5)
            .on("mousedown", function(d){
                d3.select(this).style("cursor", "grabbing")
            })
            .on("mouseup", function(d){
                d3.select(this).style("cursor", "grab")
            })
            .call(drag);

        function updateSliderLineChart(data) {
            const dataWithoutZeroes = data.filter(obj => obj.value > 0)
            yScale.domain([0, Math.max(...data.map(obj => obj.value))]);

            sliderSvg.select('.yAxis-slider')
                .transition()
                .call(yAxis);

            var slider = sliderSvg.selectAll('.slider-linechart').data([dataWithoutZeroes], function (d) { return d.year });

            slider
                .enter()
                .append("path")
                .attr("class", "slider-linechart")
                .merge(slider)
                .transition()
                .ease(d3.easePolyInOut)
                .duration(1000)
                .attr("d", d3.line()
                    .curve(d3.curveCardinal)
                    .x(function (d) {
                        return xScale(new Date(d.year));
                    })
                    .y(function (d) {
                        return yScale(d.value);
                    })
                    .defined(function (d) {
                        return d.value > 0;
                    }))
                .attr("fill", "none")
                .attr("stroke", "#3271e7")
                .attr("stroke-width", 1.5);
        }

        updateSliderLineChart(totalAverages);

        function updateMapWithNewCrimeCategory(selectedGroup) {
            let features = allFeaturesWithoutUnknown;

            // select the data from the chart that we actually want/need
            if (selectedGroup !== allCategories[0]) {
                features = features.filter(element => {
                    return element["properties"]["fact_category"] === selectedGroup;
                });
            }

            currentDataDisplayedBasedOnCategory = features;
            yearAverages = constructAvgsFromCounts(constructCountsPerYear(currentDataDisplayedBasedOnCategory, quarterGeometryDataWithoutUnknown))
            maxAvg = getAllYearExtrema(yearAverages)[0];
            totalAverages = Array.from(constructTotalYearAvgs(yearAverages), ([year, value]) => ({ year, value }));


            // filter the data based on YEAR
            updateSliderLineChart(totalAverages);

            // plot the changed map
            map.data(dataToMapDataFormat(yearAverages, quarterGeometryDataWithoutUnknown, maxAvg, currentYear))
                .attr("fill", (d, _) => {
                    const properties = d["properties"];
                    const count = properties.count;
                    const maxCount = properties.max;

                    const totalAvginYear = totalAverages[currentYear - beginYear];
                    let selectedColor;

                    if (totalAvginYear.value > 0) {
                        selectedColor = linearScaleColour(count, maxCount);
                    } else {
                        selectedColor = NO_DATA_COLOR
                    }
                    return selectedColor;
                });
        }


        function updateSlideronClick(e) {
            const handle = d3.select("#slider-handle");
            var handlew = +handle.attr("width");
            const root = d3.select(this);

            const rootclient = root.node().getBoundingClientRect();
            var rootw = +root.attr("width");


            var computedx = Math.max(0, Math.min(rootw - handlew - 20, e.x - rootclient.x));

            let xYear = xScale.invert(computedx);

            let snappedx = roundtoYear(xYear);
            updateSlider(snappedx);
        }

        d3.select("#slider-svg").on("click", updateSlideronClick);

        // ----- Helper function to update the slider's position -----
        function updatesliderposition(date) {
            let handlew = +handle.attr("width");

            let datex = xScale(date);

            handle.transition().attr("x", datex - handlew / 2);


        }

        let timer; // timer we will use to check if slider already needs to move or not
        playButton
            .on("click", function () {
                const button = d3.select(this);
                if (button.attr("class") === "playing") {  // TODO: maybe don't use the "pause" text to check which state we are in, use some class?
                    sliderIsMoving = false;
                    clearInterval(timer);
                    button.classed('paused', true);
                    button.classed('playing', false);
                    button.select("i").attr('class', 'bi bi-play');
                } else {
                    sliderIsMoving = true;
                    // wait 1/4 sec before going to the next step
                    timer = setInterval(stepOnSlider, 2000);
                    button.classed('playing', true);
                    button.classed('paused', false);
                    button.select("i").attr('class', 'bi bi-pause');
                    // button.text("Pause");
                }
            });

        // execute 1 step on the slider
        function stepOnSlider() {

            const nextDate = toNextRoundYear(currentYear);
            if (nextDate < xScale.domain()[1]) {
                updateSlider(nextDate);
            }
            // stop the play button 
            else {
                sliderIsMoving = false;
                updateSlider(roundtoYear(xScale.invert(0)));
                clearInterval(timer);
                playButton.classed("paused", true);
                playButton.classed("playing", false);
                playButton.select("i").attr('class', 'bi bi-play');

            }

        }

        // this function is called every time the position of the slider changes, here we update the data
        function updateSlider(date) {
            // TODO: if the tooltip is shown, this should also be updated when we have a change here
            // update position and text of label according to slider scale
            updatesliderposition(date);
            // xPositionOnSlider = xScale(date);

            const year = date.getFullYear();
            // TODO: only replace year if it is different, and only then we should refilter and redraw everything (perhaps also looking if the crime category changed?)
            currentYear = year.toString();

            map.data(dataToMapDataFormat(yearAverages, quarterGeometryDataWithoutUnknown, maxAvg, currentYear))
                .attr("fill", (d, _) => {
                    const properties = d["properties"];
                    const count = properties.count;
                    const maxCount = properties.max;

                    const totalAvginYear = totalAverages[currentYear - beginYear];

                    let selectedColor;

                    if (totalAvginYear.value > 0) {
                        selectedColor = linearScaleColour(count, maxCount);
                    } else {
                        selectedColor = NO_DATA_COLOR
                    }
                    return selectedColor;
                });
        }

    }
};
</script>

<template>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <div id="chartWrapper">
        <!-- Dropdown used for all the categories -->
        <select id="selectButton"></select>
        <!-- container where the map, tooltip and slider itself will be placed -->
        <div id="mapContainer" />
        <div id="sliderContainer">
            <!-- button to play/pause the slider -->
            <button id="playButton" class="paused"><i class="bi bi-play"></i></button>
            <!-- div where we will place the slider -->
            <div id="sliderDiv" />
        </div>
    </div>
</template>

<style scoped>
#playButton {
    background: #f08080;
    border-radius: 3px;
    border: none;
    color: white;
    margin: 0;
    padding: 0 12px;
    width: 40px;
    cursor: pointer;
    height: 65px;
}

#playButton:hover {
    background-color: #db5252;
}

#sliderContainer {
    display: flex;
    flex-wrap: nowrap;
}
</style>