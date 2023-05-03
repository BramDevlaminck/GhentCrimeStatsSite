<script>
import InteractiveMap from "@/components/maps/InteractiveMap.vue";
import TotalCrimesMap from "@/components/maps/TotalCrimesMap.vue";
import BikeMap from "@/components/maps/BikeMap.vue";

export default {
    components: {BikeMap, TotalCrimesMap, InteractiveMap},
    props: {
        allFeatures: Array,
        beginDate: Date,
        endDate: Date,
        crimeTypes: Set,
        quarterGeometryData: Map,
        bikeParkingPerQuarter: Map,
        allFeaturesWithoutUnknown: Array,
        quarterGeometryDataWithoutUnknown: Map,
        quarterGeometrySmall: Object
    },
    name: "Maps"
};
</script>

<template>
    <div>
        <InteractiveMap :all-features="allFeaturesWithoutUnknown"
                        :begin-date="beginDate"
                        :end-date="endDate"
                        :crime-types="crimeTypes"
                        :quarter-geometry-data="quarterGeometryData"
                        :bike-parking-per-quarter="bikeParkingPerQuarter"
                        :quarter-geometry-data-without-unknown="quarterGeometryDataWithoutUnknown"
                        :quarter-geometry-small="quarterGeometrySmall"/>
        <BikeMap :all-features="allFeaturesWithoutUnknown"
                 :quarter-geometry-small="quarterGeometrySmall"
                 :bike-parking-per-quarter="bikeParkingPerQuarter"
                 :quarter-geometry-data="quarterGeometryDataWithoutUnknown"/>
        <TotalCrimesMap :all-features="allFeaturesWithoutUnknown"
                        :quarter-geometry-small="quarterGeometrySmall"
                        :quarter-geometry-data="quarterGeometryDataWithoutUnknown"
                        :crime-types="crimeTypes"/>
    </div>
</template>

<style scoped>

</style>