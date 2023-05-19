<script>
import * as d3 from "d3";

import {constructAvgsFromCounts, constructCountsPerYear, InteractiveMap} from "../d3Implementations/InteractiveMap";

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
        const beginDate = this.beginDate;
        const endDate = this.endDate;
        // DATA
        const allFeaturesWithoutUnknown = this.allFeatures;
        const quarterGeometrySmall = this.quarterGeometrySmall;
        const quarterGeometryDataWithoutUnknown = this.quarterGeometryDataWithoutUnknown;

        let yearAverages = constructAvgsFromCounts(constructCountsPerYear(allFeaturesWithoutUnknown, quarterGeometryDataWithoutUnknown));

        new InteractiveMap("#mapContainer", allFeaturesWithoutUnknown, quarterGeometrySmall, quarterGeometryDataWithoutUnknown, yearAverages, beginDate, endDate, this.crimeTypes);

    },
    beforeUnmount() {
        d3.selectAll('#mapContainer svg').remove();
        d3.selectAll('#sliderContainer svg').remove();
        d3.selectAll('#selectButton option').remove();
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