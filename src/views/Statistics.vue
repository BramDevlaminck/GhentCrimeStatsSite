<script>

import YearOverviewGraph from "@/components/YearOverviewGraph.vue";

// function to read the data
async function getData(filename) {
  return await fetch("./Datasets/" + filename)
      .then(res => res.json())
      .catch(() => {
        console.error("Something went wrong while trying to read the file ./Datasets/" + filename);
        return []; // return empty array to make sure the awaited data is iterable
      })
}

// read the data
const crime2018 = await getData("criminaliteitscijfers-per-wijk-per-maand-gent-2018.json")
const crime2019 = await getData("criminaliteitscijfers-per-wijk-per-maand-gent-2019.json")
const crime2020 = await getData("criminaliteitscijfers-per-wijk-per-maand-gent-2020.json")
const crime2021 = await getData("criminaliteitscijfers-per-wijk-per-maand-gent-2021.json")
const crime2022 = await getData("criminaliteitscijfers-per-wijk-per-maand-gent-2022.json")
const crime2023 = await getData("criminaliteitscijfers-per-wijk-per-maand-gent-2023.json")

// combine it
const combinedData = [...crime2018, ...crime2019, ...crime2020, ...crime2021, ...crime2022, ...crime2023];

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
const monthTranslation = new Map(Object.entries({
  "januari": "January",
  "februari": "February",
  "maart": "March",
  "april": "April",
  "mei": "May",
  "juni": "June",
  "juli": "July",
  "augustus": "August",
  "september": "September",
  "oktober": "October",
  "november": "November",
  "december": "December",
}));

combinedData.forEach(datum => {
  const splittedDate = datum.jaar_maand.split("-");
  datum.formatted_date = monthMapping.get(splittedDate[1]) + " " + splittedDate[2] + " " + splittedDate[0];
  datum.month = monthTranslation.get(datum.month);
});

const dataPerQuarter = {};
// build set to keep track of what we already added
const alreadyAdded = {};

combinedData.forEach((entry) => {
      let quarter = entry["quarter"];

      let quarterObject = {};
      let quarterSetObject = {};
      if (quarter in dataPerQuarter) {
        quarterObject = dataPerQuarter[quarter];
        quarterSetObject = alreadyAdded[quarter];
      }

      let crimeCategory = entry["fact_category"];

      let categoryArray = [];
      let categorySet = new Set();
      if (crimeCategory in quarterObject) {
        categoryArray = quarterObject[crimeCategory];
        categorySet = quarterSetObject[crimeCategory];
      }

      // object we want to save
      let toPush = {
        "formatted_date": entry["formatted_date"],
        "geo_point_2d": entry["geo_point_2d"],
        "geometry": entry["geometry"],
        "jaar_maand": entry["jaar_maand"],
        "month": entry["month"],
        "quarter_code": entry["quarter_code"],
        "total": entry["total"],
        "year": entry["year"]
      };
      // if we already have this month for this quarter and category, overwrite it when the current value is bigger
      if (categorySet.has(toPush["jaar_maand"])) {
        for (const [i, obj] of categoryArray.entries()) {
          if (obj["jaar_maand"] === toPush["jaar_maand"]) {
            if (obj["total"] < toPush["total"]) {
              categoryArray[i] = toPush;
            }
            break;
          }
        }
      } else { // this month has not yet any data in this quarter and year
        categoryArray.push(toPush);
        categorySet.add(toPush["jaar_maand"]);
      }

      // update the data in the objects
      quarterObject[crimeCategory] = categoryArray;
      quarterSetObject[crimeCategory] = categorySet;
      dataPerQuarter[quarter] = quarterObject;
      alreadyAdded[quarter] = quarterSetObject;
    }
);

const combinedDataDeduplicated = []

// fill in the array
for (const [quarter, quarterData] of Object.entries(dataPerQuarter)) {
  for (const [crime, crimeData] of Object.entries(quarterData)) {
    crimeData.forEach((entry) => {
      combinedDataDeduplicated.push({
        jaar_maand: entry["jaar_maand"],
        year: entry["year"],
        month: entry["month"],
        fact_category: crime,
        quarter: quarter,
        quarter_code: entry["quarter_code"],
        total: entry["total"],
        geometry: entry["geometry"],
        geo_point_2d: entry["geo_point_2d"],
        formatted_date: entry["formatted_date"]
      });
    });
  }
}

export default {
  components: {
    YearOverviewGraph
  },
  data() {
    return {
      combinedDataDeduplicated
    }
  },
  computed: {
      dataIsAvailable: () => {
        return combinedDataDeduplicated.length > 0
      }
  }
}

</script>

<template>
  <div class="container-lg">
    <h1>Statistics page</h1>
  </div>
  <YearOverviewGraph :combinedData="combinedDataDeduplicated" v-if="dataIsAvailable"/>
  <h4 v-if="!dataIsAvailable">No data available</h4>
</template>

<style scoped>

</style>