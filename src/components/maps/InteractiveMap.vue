<script>
//TODO:!https://fonts.googleapis.com/css?family=Special+Elite apply this font in some places?
import * as d3 from "d3";

import colourScales from '../ColourScales';

const { scaleToInterval, linearScaleColour, interpolateBluesMod } = colourScales(0.07, 1.0);

// TODO: change this if needed? not really clean this way
const WIDTH = window.innerWidth / 2;
const HEIGHT = window.innerHeight / 2;
const HOVER_COLOR = "#db5252";
const NO_DATA_COLOR = "#f08080";


// ------ Year functions  ------
function roundtoYear(x) {
    const xYear = x.getFullYear();
    let yearms = 1000 * 60 * 60 * 24;
    // leapyear
    if (xYear % 4 === 0 && xYear % 100 !== 0) {
        yearms *= 366;
    } else {
        yearms *= 365;
    }
    const halfyearms = yearms / 2;

    return new Date(new Date(x.valueOf() + halfyearms).getUTCFullYear(), 0, 1);
}

function toNextRoundYear(x) {
    const nextYear = (+x) + 1;

    return new Date(nextYear, 0, 1);
}

function getUniqueYears(data) {
    let years = data.map(obj => obj.year);
    return years.filter((year, index, self) => self.indexOf(year) === index);
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
        const quarter = obj["quarter"];
        const month = obj["month"];
        const year = obj["year"];

        const currentCountMap = yearCounts.get(year);


        const currentMonthCount = currentCountMap.get(quarter);
        if (currentMonthCount.has(month)) {
            currentMonthCount.set(month, currentMonthCount.get(month) + obj["total"]);
        } else {
            currentMonthCount.set(month, obj['total']);
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
            for (const [_, count] of months) {
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
        for (const [_, avg] of quarters) {
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
    props: {
        allFeatures: Array,
        beginDate: Date,
        endDate: Date,
        crimeTypes: Set,
        quarterGeometryData: Map,
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
        const mapContainerClient = mapSvg.node().getBoundingClientRect(); //to get component width as rendered on the client

        // LEGEND
        const barheight = 200;
        const barwidth = 20;

        const barX = mapContainerClient.width - barwidth - 30;
        const barY = 50;

        function createColorScaleLegend(root, x, y, width, height, min, max) {
            // Linear scale for y-axis
            const yColourScale = d3
                .scaleLinear()
                .domain([min, max])
                .range([height, 0]);

            const yColorAxis = d3.axisRight(yColourScale);
            const colourticks = yColourScale.ticks(4);
            colourticks.push(max);
            yColorAxis.tickValues(colourticks);

            root.append("g")
                .attr("class", "colorAxis")
                .attr("transform", `translate(${x + width},${y})`)
                .call(yColorAxis)
                .select(".domain")
                .attr("visibility", "hidden");

            const colorScale = d3
                .scaleSequential(interpolateBluesMod)
                .domain([min, max])

            const ticks = colorScale.ticks().concat(colorScale.domain()[1]);

            const defs = root.append('defs');

            const grad = defs.append('linearGradient')
                .attr('id', "linear-gradient")
                .attr('x1', '0%')
                .attr('x2', '0%')
                .attr('y1', '100%')
                .attr('y2', '0%');

            grad.selectAll('stop')
                .data(ticks.map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: colorScale(t) })))
                .enter()
                .append('stop')
                .style('stop-color', (d) => d.color)
                .attr('offset', (d) => d.offset);

            root.append('rect')
                .attr('x', x)
                .attr('y', y)
                .attr('width', width)
                .attr('height', height)
                .style('fill', 'url(#linear-gradient)');
        }

        createColorScaleLegend(mapSvg, barX, barY, barwidth, barheight, 0, maxAvg);

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
            const totalAvgInYear = totalAverages[currentYear - 2018];

            if (totalAvgInYear.value > 0) {
                const selectedColor = linearScaleColour(count, maxCount);
                d3.select(this).attr("fill", selectedColor);
            } else {
                d3.select(this).attr("fill", NO_DATA_COLOR);
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
            const totalAvgInYear = totalAverages[currentYear - beginYear];

            if (totalAvgInYear.value > 0) {
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
            .fitExtent([[20, 20], [mapContainerClient.width - 20, mapContainerClient.height - 20]], quarterGeometrySmall);
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
            .text(d => d) // text showed in the menu
            .attr("value", d => d); // corresponding value returned by the button

        // Listen to dropdown
        d3.select("#selectButton").on("change", function (_) {
            updateMapWithNewCrimeCategory(this.value);
        });

        // ----------------------------- slider ------------------------------
        //translate date obj to Year string (e.g: "2018")
        function dateToYearString(date) {
            return date.getFullYear().toString();
        }

        const sliderHandleWidth = 12;
        const sliderLeftPadding = 40;
        const sliderTopPadding = 7.5;
        const sliderBottomPadding = 25;

        const heightSlider = 90;

        let sliderIsMoving = false;

        const maxXPositionOnSlider = mapContainerClient.width;

        const playButton = d3.select("#playButton");

        // gives the position on the sliders as an x-value
        // domain starts a little bit before 2018, to let the 2018 tick appear on the axis
        const xScale = d3.scaleTime()
            .domain([new Date(Date.UTC(parseInt(beginYear), 0, 0, 0, 0, 0)), new Date(endYear)])
            .range([sliderLeftPadding, maxXPositionOnSlider])
            .clamp(true);

        let xPositionOnSlider = xScale(roundtoYear(xScale.invert(0)));

        // create the slider
        const sliderSvg = d3.select("#sliderDiv")
            .append("svg")
            .attr("id", "slider-svg")
            .attr("width", mapContainerClient.width + sliderLeftPadding)
            .attr("height", heightSlider);
        const sliderContainerClient = sliderSvg.node().getBoundingClientRect();

        //linear value scale for the slider line chart
        const yScale = d3.scaleLinear()
            .domain([0, Math.max(...totalAverages.map(obj => obj.value))])
            .range([sliderContainerClient.height - sliderBottomPadding, sliderTopPadding])
            .nice();

        //SLIDER TIME SCALE
        const xAxis = d3.axisBottom(xScale);
        xAxis.ticks((+endYear) - (+beginYear) + 1, "%Y");
        //SLIDER VALUE SCALE
        const yAxis = d3.axisLeft(yScale);
        yAxis.ticks(3);

        //Append axis svgs
        sliderSvg.append("g")
            .attr("class", "xAxis-slider")
            .attr("transform", `translate(0, ${sliderContainerClient.height - 25})`)
            .call(xAxis);

        const yAxisg = sliderSvg.append("g")
            .attr("class", "yAxis-slider")
            .attr("transform", `translate(${sliderLeftPadding}, 0)`)
            .call(yAxis);
        //y axis title on hover
        yAxisg
            .style('cursor', 'alias')
            .append('title')
            .text("Totaal Maandelijkse Gemiddelde\n(som van de gemiddelden over heel gent)");

        // drag behavior functions
        function dragMove(e) {
            const handle = d3.select(this);
            handle.style("cursor", "grabbing")
                .style("fill", "#3c73d7");
            const handlew = +handle.attr("width");

            const computedx = Math.max(sliderLeftPadding - handlew / 2, Math.min(maxXPositionOnSlider - handlew / 2, e.x));

            handle.attr("x", computedx);
        }

        function dragend(_) {
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
            .on("drag", dragMove)
            .on("end", dragend);

        //slider's handle
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
            .on("mousedown", function (d) {
                d3.select(this).style("cursor", "grabbing");
            })
            .on("mouseup", function (d) {
                d3.select(this).style("cursor", "grab");
            })
            .call(drag);

        //change slider's background line chart (on category change)
        function updateSliderLineChart(data) {
            const dataWithoutZeroes = data.filter(obj => obj.value > 0);
            yScale.domain([0, Math.max(...data.map(obj => obj.value))]);
            sliderSvg.select('.yAxis-slider')
                .transition()
                .call(yAxis);

            const slider = sliderSvg.selectAll('.slider-linechart').data([dataWithoutZeroes], function (d) {
                return d.year;
            });

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
                    .x(d => xScale(new Date(d.year)))
                    .y(d => yScale(d.value))
                    .defined(d => d.value > 0))
                .attr("fill", "none")
                .attr("stroke", "#3271e7")
                .attr("stroke-width", 1.5);
        }
        //first call
        updateSliderLineChart(totalAverages);

        //later calls here
        function updateMapWithNewCrimeCategory(selectedGroup) {
            let features = allFeaturesWithoutUnknown;

            // select the data from the chart that we actually want/need
            if (selectedGroup !== allCategories[0]) {
                features = features.filter(element => {
                    return element["fact_category"] === selectedGroup;
                });
            }

            currentDataDisplayedBasedOnCategory = features;
            yearAverages = constructAvgsFromCounts(constructCountsPerYear(currentDataDisplayedBasedOnCategory, quarterGeometryDataWithoutUnknown));
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
                        selectedColor = NO_DATA_COLOR;
                    }
                    return selectedColor;
                });
        }

        //clicking somewhere on the slider moves the handle 
        function updateSliderOnClick(e) {
            const handle = d3.select("#slider-handle");
            const handlew = +handle.attr("width");
            const root = d3.select(this);

            const rootclient = root.node().getBoundingClientRect();
            const rootw = +root.attr("width");


            const computedx = Math.max(0, Math.min(rootw - handlew - 20, e.x - rootclient.x));

            let xYear = xScale.invert(computedx);

            let snappedx = roundtoYear(xYear);
            updateSlider(snappedx);
        }

        d3.select("#slider-svg").on("click", updateSliderOnClick);

        //little interaction helper
        sliderSvg.append('title')
            .text('klik waar dan ook op deze graaf\nof probeer de gekleurde rechthoek te slepen\nom het getoond jaar te veranderen!');

        // ----- Helper function to update the slider's position -----
        function updateSliderPosition(date) {
            let handlew = +handle.attr("width");

            let datex = xScale(date);

            handle.transition().attr("x", datex - handlew / 2);
        }

        // ------- Automatic play animation -------
        let timer; // timer we will use to check if slider already needs to move or not
        playButton
            .on("click", function () {
                const button = d3.select(this);
                if (button.attr("class") === "playing") {
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
                }
            });

        // execute 1 step on the slider (helper)
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
            updateSliderPosition(date);

            const year = date.getFullYear();
            // TODO: only replace year if it is different, and only then we should refilter and redraw everything (perhaps also looking if the crime category changed?)
            currentYear = year.toString();

            map.data(dataToMapDataFormat(yearAverages, quarterGeometryDataWithoutUnknown, maxAvg, currentYear))
                .attr("fill", (d, _) => {
                    const properties = d["properties"];
                    const count = properties.count;
                    const maxCount = properties.max;

                    const totalAvgInYear = totalAverages[currentYear - beginYear];

                    let selectedColor;

                    if (totalAvgInYear.value > 0) {
                        selectedColor = linearScaleColour(count, maxCount);
                    } else {
                        selectedColor = NO_DATA_COLOR;
                    }
                    return selectedColor;
                });
        }

    },
    beforeUnmount() {
        d3.selectAll('#mapContainer svg').remove();
        d3.selectAll('#sliderContainer svg').remove();
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