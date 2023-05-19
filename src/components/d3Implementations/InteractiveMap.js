import colourScales from "../ColourScales";
import {D3Map} from "./D3MapFunctions";
import * as d3 from "d3";
import {createDropdown} from "../D3Functions";

const {linearScaleColour} = colourScales(0.07, 1.0);
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

export function constructCountsPerYear(data, quarterGeometryData) {
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

export function constructAvgsFromCounts(yearCounts) {
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
            properties: {"quarter": quarter, "count": avg, "max": maxAvg},
            type: "Feature",
            geometry: quarterGeometryData.get(quarter)
        });
    }
    return result;
}

export class InteractiveMap extends D3Map {
    constructor(id, allFeatures, quarterGeometrySmall, quarterGeometryData, yearAverages, beginDate, endDate, crimeTypes) {
        super(id, allFeatures, quarterGeometrySmall, quarterGeometryData, yearAverages, "Maandelijks Gemiddelde");
        this.crimeTypes = crimeTypes
        // DATES
        beginDate = new Date(beginDate);
        endDate = new Date(endDate);
        this.beginYear = this.dateToYearString(beginDate);
        this.endYear = this.dateToYearString(endDate);
        this.currentYear = "2018"
        this.totalAverages = Array.from(constructTotalYearAvgs(yearAverages), ([year, value]) => ({year, value}));
        this.currentMax = getAllYearExtrema(yearAverages)[0];
        this.allCategories = ["Alle Categorieën"].concat([...this.crimeTypes]);
        this.create();
        this.mapContainerClient = this.mapSvg.node().getBoundingClientRect();
        this.setDropDown();
        this.slider();
    }

    dataToMapFormat(data, quarterGeometryData, totalPerQuarter) {
        return dataToMapDataFormat(this.totalPerQuarter, this.quarterGeometryData, this.currentMax, this.currentYear);
    }

    updateTooltip(event, data) {
        const properties = data["properties"];
        const count = properties.count;
        const quarter = properties.quarter;
        const totalAvgInYear = this.totalAverages[this.currentYear - this.beginYear];

        if (totalAvgInYear.value > 0) {
            this.tooltip
                .html("Regio: " + quarter + "<br>Maandelijks gemiddeld aantal voorvallen in " + this.currentYear + " : " + (Math.round(count * 100) / 100).toFixed(2))
                .style("left", ((event.pageX) + 20) + "px")
                .style("top", (event.pageY) + "px");
        } else {
            this.tooltip
                .html("Regio: " + quarter + "<br>Geen data voor het jaar " + this.currentYear)
                .style("left", ((event.pageX) + 20) + "px")
                .style("top", (event.pageY) + "px");
        }
    }

    mouseOutHandler(event, data) {
        const properties = data["properties"];
        const count = properties.count;
        const maxCount = properties.max;

        const totalAvgInYear = this.totalAverages[this.currentYear - 2018];

        if (totalAvgInYear.value > 0) {
            const selectedColor = linearScaleColour(count, maxCount);
            d3.select(event.target).attr("fill", selectedColor);
        } else {
            d3.select(event.target).attr("fill", NO_DATA_COLOR);
        }

        this.tooltip.style("opacity", 0);
    }

    colorMap(d, _) {
        const properties = d["properties"];
        const count = properties.count;
        const maxCount = properties.max;

        const totalAvgInYear = this.totalAverages[this.currentYear - this.beginYear];

        let selectedColor;

        if (totalAvgInYear.value > 0) {
            selectedColor = linearScaleColour(count, maxCount);
        } else {
            selectedColor = NO_DATA_COLOR;
        }
        return selectedColor;
    }

    getCurrentMax() {
        return this.currentMax;
    }

    //----------- dropdown --------------
    setDropDown() {
        this.currentDataDisplayedBasedOnCategory = this.allFeatures; // all data of the current category!
        // Function to update the map if a new crime category is chosen

        // add the options to the button
        createDropdown("#selectButton", this.allCategories, (value) => this.updateMapWithNewCrimeCategory(value));
    }

    slider() {
        // ----------------------------- slider ------------------------------

        this.sliderDimensions = {
            sliderHandleWidth: 12,
            sliderLeftPadding: 40,
            sliderTopPadding: 7.5,
            sliderBottomPadding: 25
        }

        const heightSlider = 90;

        this.maxXPositionOnSlider = this.mapContainerClient.width;

        this.playButton = d3.select("#playButton");

        // gives the position on the sliders as an x-value
        // domain starts a little bit before 2018, to let the 2018 tick appear on the axis
        this.xScale = d3.scaleTime()
            .domain([new Date(Date.UTC(parseInt(this.beginYear), 0, 0, 0, 0, 0)), new Date(this.endYear)])
            .range([this.sliderDimensions.sliderLeftPadding, this.maxXPositionOnSlider])
            .clamp(true);

        let xPositionOnSlider = this.xScale(roundtoYear(this.xScale.invert(0)));

        // create the slider
        this.sliderSvg = d3.select("#sliderDiv")
            .append("svg")
            .attr("id", "slider-svg")
            .attr("width", this.mapContainerClient.width + this.sliderDimensions.sliderLeftPadding)
            .attr("height", heightSlider);
        const sliderContainerClient = this.sliderSvg.node().getBoundingClientRect();

        //linear value scale for the slider line chart
        this.yScale = d3.scaleLinear()
            .domain([0, Math.max(...this.totalAverages.map(obj => obj.value))])
            .range([sliderContainerClient.height - this.sliderDimensions.sliderBottomPadding, this.sliderDimensions.sliderTopPadding])
            .nice();

        //SLIDER TIME SCALE
        const xAxis = d3.axisBottom(this.xScale);
        xAxis.ticks((+this.endYear) - (+this.beginYear) + 1, "%Y");
        //SLIDER VALUE SCALE
        this.yAxis = d3.axisLeft(this.yScale);
        this.yAxis.ticks(3);

        //Append axis svgs
        this.sliderSvg.append("g")
            .attr("class", "xAxis-slider")
            .attr("transform", `translate(0, ${sliderContainerClient.height - 25})`)
            .call(xAxis);

        const yAxisg = this.sliderSvg.append("g")
            .attr("class", "yAxis-slider")
            .attr("transform", `translate(${this.sliderDimensions.sliderLeftPadding}, 0)`)
            .call(this.yAxis);
        //y axis title on hover
        yAxisg
            .style('cursor', 'alias')
            .append('title')
            .text("Totaal Maandelijkse Gemiddelde\n(som van de gemiddelden over heel gent)");

        const drag = d3.drag()
            .on("drag", this.dragMove.bind(this))
            .on("end", this.dragend.bind(this));

        //slider's handle
        this.handle = this.sliderSvg.append('rect')
            .attr("id", "slider-handle")
            .attr("x", xPositionOnSlider - this.sliderDimensions.sliderHandleWidth / 2)
            .attr("y", 0)
            .attr("width", this.sliderDimensions.sliderHandleWidth)
            .attr("height", () => {
                return this.sliderSvg.attr("height") - 25;
            })
            .style("fill", 'cornflowerblue')
            .style("cursor", "grab")
            .style("opacity", 0.5)
            .on("mousedown", function (_) {
                d3.select(this).style("cursor", "grabbing");
            })
            .on("mouseup", function (_) {
                d3.select(this).style("cursor", "grab");
            })
            .call(drag);
        //first call
        this.updateSliderLineChart(this.totalAverages);

        this.setSliderSvg();
        this.setAutomaticPlayAnimation();
    }

    //translate date obj to Year string (e.g: "2018")
    dateToYearString(date) {
        return date.getFullYear().toString();
    }

    // drag behavior functions
    dragMove(e) {
        const handle = d3.select(e.target);
        handle.style("cursor", "grabbing")
            .style("fill", "#3c73d7");
        const handlew = +handle.attr("width");

        const computedx = Math.max(this.sliderDimensions.sliderLeftPadding - handlew / 2, Math.min(this.maxXPositionOnSlider - handlew / 2, e.x));

        handle.attr("x", computedx);
    }

    dragend(e, _) {
        let handle = d3.select(e.target);
        handle.style("cursor", "grab")
            .style("fill", "cornflowerblue");
        let handlex = +handle.attr("x");
        let handlew = +handle.attr("width");
        let handlemidx = handlex + (handlew / 2);

        let xYear = this.xScale.invert(handlemidx);
        let snappedx = roundtoYear(xYear);

        this.updateSlider(snappedx);
    }

    //change slider's background line chart (on category change)
    updateSliderLineChart(data) {
        const dataWithoutZeroes = data.filter(obj => obj.value > 0);
        this.yScale.domain([0, Math.max(...data.map(obj => obj.value))]);
        this.sliderSvg.select('.yAxis-slider')
            .transition()
            .call(this.yAxis);

        const slider = this.sliderSvg.selectAll('.slider-linechart').data([dataWithoutZeroes], function (d) {
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
                .x(d => this.xScale(new Date(d.year)))
                .y(d => this.yScale(d.value))
                .defined(d => d.value > 0))
            .attr("fill", "none")
            .attr("stroke", "#3271e7")
            .attr("stroke-width", 1.5);
    }

    //later calls here
    updateMapWithNewCrimeCategory(selectedGroup) {
        let features = this.allFeatures;

        // select the data from the chart that we actually want/need
        if (selectedGroup !== this.allCategories[0]) {
            features = features.filter(element => {
                return element["fact_category"] === selectedGroup;
            });
        }

        this.currentDataDisplayedBasedOnCategory = features;
        this.totalPerQuarter = constructAvgsFromCounts(constructCountsPerYear(this.currentDataDisplayedBasedOnCategory, this.quarterGeometryData));
        this.currentMax = getAllYearExtrema(this.totalPerQuarter)[0];
        this.totalAverages = Array.from(constructTotalYearAvgs(this.totalPerQuarter), ([year, value]) => ({
            year,
            value
        }));


        // filter the data based on YEAR
        this.updateSliderLineChart(this.totalAverages);

        //change the colour scale legend axis
        this.updateLegendAxis(this.currentMax);

        // plot the changed map
        this.map.data(dataToMapDataFormat(this.totalPerQuarter, this.quarterGeometryData, this.currentMax, this.currentYear))
            .attr("fill", (d, _) => {
                const properties = d["properties"];
                const count = properties.count;
                const maxCount = properties.max;

                const totalAvginYear = this.totalAverages[this.currentYear - this.beginYear];
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
    updateSliderOnClick(e) {
        const handle = d3.select("#slider-handle");
        const handlew = +handle.attr("width");
        const root = d3.select(e.target);

        const rootclient = root.node().getBoundingClientRect();
        const rootw = +root.attr("width");


        const computedx = Math.max(0, Math.min(rootw - handlew - 20, e.x - rootclient.x));

        let xYear = this.xScale.invert(computedx);

        let snappedx = roundtoYear(xYear);
        this.updateSlider(snappedx);
    }

    setSliderSvg() {
        d3.select("#slider-svg").on("click", this.updateSliderOnClick.bind(this));

        //little interaction helper
        this.sliderSvg.append('title')
            .text('klik waar dan ook op deze graaf\nof probeer de gekleurde rechthoek te slepen\nom het getoond jaar te veranderen!');
    }

    setAutomaticPlayAnimation() {
        // ------- Automatic play animation -------
        this.playButton
            .on("click", (event, _) => {
                const button = d3.select("#playButton");
                if (button.attr("class") === "playing") {
                    clearInterval(this.timer);
                    button.classed('paused', true);
                    button.classed('playing', false);
                    button.select("i").attr('class', 'bi bi-play');
                } else {
                    // wait 1/4 sec before going to the next step
                    this.timer = setInterval(this.stepOnSlider.bind(this), 2000);
                    button.classed('playing', true);
                    button.classed('paused', false);
                    button.select("i").attr('class', 'bi bi-pause');
                }
            });
    }

    // ----- Helper function to update the slider's position -----
    updateSliderPosition(date) {
        let handlew = +this.handle.attr("width");

        let datex = this.xScale(date);

        this.handle.transition().attr("x", datex - handlew / 2);
    }

    // execute 1 step on the slider (helper)
    stepOnSlider() {

        const nextDate = toNextRoundYear(this.currentYear);
        if (nextDate < this.xScale.domain()[1]) {
            this.updateSlider(nextDate);
        }
        // stop the play button
        else {
            this.updateSlider(roundtoYear(this.xScale.invert(0)));
            clearInterval(this.timer);
            this.playButton.classed("paused", true);
            this.playButton.classed("playing", false);
            this.playButton.select("i").attr('class', 'bi bi-play');

        }

    }

    // this function is called every time the position of the slider changes, here we update the data
    updateSlider(date) {
        // update position and text of label according to slider scale
        this.updateSliderPosition(date);

        const year = date.getFullYear();
        this.currentYear = year.toString();

        this.map.data(dataToMapDataFormat(this.totalPerQuarter, this.quarterGeometryData, this.currentMax, this.currentYear))
            .attr("fill", (d, _) => {
                const properties = d["properties"];
                const count = properties.count;
                const maxCount = properties.max;

                const totalAvgInYear = this.totalAverages[this.currentYear - this.beginYear];

                let selectedColor;

                if (totalAvgInYear.value > 0) {
                    selectedColor = linearScaleColour(count, maxCount);
                } else {
                    selectedColor = NO_DATA_COLOR;
                }
                return selectedColor;
            });
    }
}
