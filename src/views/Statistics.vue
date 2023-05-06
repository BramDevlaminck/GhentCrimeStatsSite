<script>

import rewind from "@mapbox/geojson-rewind";
import SecondaryNavBar from "@/components/SecondaryNavBar.vue";
import Maps from "@/components/maps/Maps.vue";
import OtherGraphs from "@/components/otherGraphs/OtherGraphs.vue";

// function to read the data
function getData(filename) {
    return fetch("./Datasets/" + filename)
        .then(res => res.json())
        .then(res => {
            rewind(res, true); // use rewind to make sure the geojson is clockwise! if this is not the case the map will not be displayed!
            return res;
        })
        .catch(() => {
            console.error("Something went wrong while trying to read the file ./Datasets/" + filename);
            return []; // return empty array to make sure the awaited data is iterable
        });
}

// load all the data
const allData = await Promise.all([
    getData("criminaliteitscijfers-per-wijk-per-maand-gent-2018.geojson"),
    getData("criminaliteitscijfers-per-wijk-per-maand-gent-2019.geojson"),
    getData("criminaliteitscijfers-per-wijk-per-maand-gent-2020.geojson"),
    getData("criminaliteitscijfers-per-wijk-per-maand-gent-2021.geojson"),
    getData("criminaliteitscijfers-per-wijk-per-maand-gent-2022.geojson"),
    getData("criminaliteitscijfers-per-wijk-per-maand-gent-2023.geojson")
])
    .then(jsonArray => {
        const features = [];
        jsonArray.forEach(dataset => {
            features.push(...dataset["features"]);
        });
        return features;
    });

const bikeParkingObject = await getData("bike_parkings_per_quarter.json");
const bikeParkingMap = new Map(Object.entries(bikeParkingObject));

// make sure we only add each quarter once
const quarterGeometryData = new Map(); // contains quarter as key, and the value is the geometry data
const quarters = new Set(); // set that will contain all the quarters
const crimeTypes = new Set(); // set that will contain all the crimeTypes

// start and end of dataset in time-wise
let smallestDate = null;
let biggestDate = null;

const dates = allData.reduce((acc, curr) => {
    const currDate = new Date(curr.properties.year);
    acc.min = !acc.min || currDate < acc.min ? currDate : acc.min;
    acc.max = !acc.max || currDate > acc.max ? currDate : acc.max;
    return acc;
}, {});
smallestDate = dates.min;
biggestDate = dates.max;


allData.forEach(obj => {
    const properties = obj["properties"];
    const quarter = properties["quarter"];
    let crime = properties["fact_category"];
    // we have to hard-code this since the datasets of 2018 and 2019 still have the old entries
    if (crime === "Verkeerongevallen met lichamelijk letsel") {
        crime = "Verkeersongevallen met lichamelijk letsel";
        properties["fact_category"] = crime;
    }
    if (!quarters.has(quarter)) {
        quarterGeometryData.set(quarter, obj["geometry"]);
        quarters.add(quarter);
    }

    crimeTypes.add(crime);
});

const monthMapping = new Map(Object.entries({
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
}));

allData.forEach(datum => {
    const splittedDate = datum.properties.jaar_maand.split("-");
    datum.properties.formatted_date = monthMapping.get(splittedDate[1]) + " " + splittedDate[2] + " " + splittedDate[0];
});

// get the properties of the geoJson, this is exactly the data we need for the non-map graphs
const dataWithoutGeoInformation = allData.map(entry => entry.properties);
let currentShownTab = 'maps';


// get the data but without the data that belongs to an unknown quarter
const quarterGeometryDataWithoutUnknown = new Map();
for (const [quarter, data] of quarterGeometryData) {
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

export default {
    components: {
        OtherGraphs,
        Maps,
        SecondaryNavBar,
    },
    data() {
        return {
            combinedDataNoGeoInfo: dataWithoutGeoInformation,
            combinedDataWithGeoInfo: allData,
            beginDate: smallestDate,
            endDate: biggestDate,
            crimeTypes: crimeTypes,
            quarterGeometryData: quarterGeometryData,
            bikeParkingMaps: bikeParkingMap,
            currentShownTab: currentShownTab,
            allFeaturesWithoutUnknown: allData.filter(entry => entry["properties"]["quarter"] !== "Onbekend"),
            quarterGeometryDataWithoutUnknown: quarterGeometryDataWithoutUnknown,
            quarterGeometrySmall: quarterGeometrySmall
        };
    },
    computed: {
        dataIsAvailable: () => {
            return dataWithoutGeoInformation.length > 0;
        },
    },
    methods: {
        tabChange(value) {
            this.currentShownTab = value;
        },
        saveFile: function () {
            const data = JSON.stringify(allData);
            const blob = new Blob([data], {type: 'text/plain'});
            const e = document.createEvent('MouseEvents'),
                a = document.createElement('a');
            a.download = "test1.json";
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
            e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
        }
    },
};

</script>

<template>
    <div class="container-lg wrapper">
        <h1>Statistics page</h1>

        <div v-if="dataIsAvailable">
            <button type="button" v-on:click="saveFile()">Save AllData json file</button>
            <OtherGraphs v-show="currentShownTab === 'other'" :combinedData="combinedDataNoGeoInfo" :crime-types="crimeTypes"/>
            <Maps v-show="currentShownTab === 'maps'"
                  :all-features="combinedDataWithGeoInfo"
                  :begin-date="beginDate"
                  :end-date="endDate"
                  :crime-types="crimeTypes" :quarter-geometry-data="quarterGeometryData"
                  :bike-parking-per-quarter="bikeParkingMaps"
                  :quarter-geometry-small="quarterGeometrySmall" :all-features-without-unknown="allFeaturesWithoutUnknown"
                  :quarter-geometry-data-without-unknown="quarterGeometryDataWithoutUnknown"/>
        </div>
        <h4 v-if="!dataIsAvailable">No data available</h4>
    </div>
    <SecondaryNavBar @tabSelected="tabChange"/>
</template>

<style scoped>
.wrapper{
    margin-bottom: 4rem;
}
</style>