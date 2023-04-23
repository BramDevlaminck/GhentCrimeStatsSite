<script>

import YearOverviewGraph from "@/components/YearOverviewGraph.vue";

// function to read the data
function getData(filename) {
    return fetch("./Datasets/" + filename)
        .then(res => res.json())
        .catch(() => {
            console.error("Something went wrong while trying to read the file ./Datasets/" + filename);
            return []; // return empty array to make sure the awaited data is iterable
        })
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
            features.push(...dataset["features"])
        });
        return features;
    });


// make sure we only add each quarter once
const quarterGeometryData = new Map(); // contains quarter as key, and the value is the geometry data
const quarters = new Set(); // set that will contain all the quarters
const crimeTypes = new Set(); // set that will contain all the crimeTypes

// start and end of dataset in time-wise
let smallestDate = null;
let biggestDate = null;

const entriesMapWithoutDuplicatesPerMonth = new Map();
allData.forEach(obj => {
    const properties = obj["properties"]
    const quarter = properties["quarter"];
    const crime = properties["fact_category"];
    const yearMonth = properties["jaar_maand"];
    const count = properties["total"]
    // just create some arbitrary key that is unique for the right cases
    const crimeEntriesKey = quarter + crime + yearMonth;
    // check if there is no entry, or the current entry is "worse" than this object
    if (!entriesMapWithoutDuplicatesPerMonth.has(crimeEntriesKey) || entriesMapWithoutDuplicatesPerMonth.get(crimeEntriesKey)["properties"]["total"] < count) {
        entriesMapWithoutDuplicatesPerMonth.set(crimeEntriesKey, obj);
    }
    if (!quarters.has(quarter)) {
        quarterGeometryData.set(quarter, obj["geometry"]);
        quarters.add(quarter);
    }

    const yearMonthAsDateObj = new Date(yearMonth)
    if (smallestDate == null || yearMonthAsDateObj < smallestDate) {
        smallestDate = yearMonthAsDateObj;
    }
    if (biggestDate == null || yearMonthAsDateObj > biggestDate) {
        biggestDate = yearMonthAsDateObj;
    }
    crimeTypes.add(crime)
});

// create 1 data array of all the entries in the map that does not contain any duplicates anymore
const featuresSingle = [...entriesMapWithoutDuplicatesPerMonth.values()]

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

featuresSingle.forEach(datum => {
    const splittedDate = datum.properties.jaar_maand.split("-");
    datum.properties.formatted_date = monthMapping.get(splittedDate[1]) + " " + splittedDate[2] + " " + splittedDate[0];
});

// combine it
const dataWithoutGeoInformation = featuresSingle.map(entry => entry.properties);


export default {
    components: {
        YearOverviewGraph
    },
    data() {
        return {
            combinedData: dataWithoutGeoInformation
        }
    },
    computed: {
        dataIsAvailable: () => {
            return dataWithoutGeoInformation.length > 0
        }
    }
}

</script>

<template>
    <div class="container-lg">
        <h1>Statistics page</h1>
    </div>
    <YearOverviewGraph :combinedData="combinedData" v-if="dataIsAvailable"/>
    <h4 v-if="!dataIsAvailable">No data available</h4>
</template>

<style scoped>

</style>