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
        quarterGeometrySmall: Object,
        numberOfResidentsPerQuarterMap: Map
    },
    name: "Maps"
};
</script>

<template>
    <div>
        <h1>
            Interactive map
        </h1>
        <h5>
            Deze kaart geeft een overzicht van het aantal misdrijven van een bepaalde categorie voor een bepaalde maand.
            De categorie kan je selecteren in de dropdown en de tijd kan je bepalen met de tijdsbalk onderaan de grafiek.
        </h5>
        <InteractiveMap :all-features="allFeaturesWithoutUnknown"
                        :begin-date="beginDate"
                        :end-date="endDate"
                        :crime-types="crimeTypes"
                        :quarter-geometry-data="quarterGeometryData"
                        :bike-parking-per-quarter="bikeParkingPerQuarter"
                        :quarter-geometry-data-without-unknown="quarterGeometryDataWithoutUnknown"
                        :quarter-geometry-small="quarterGeometrySmall"/>
        <h1>
            Kaart met fietsendiefstal
        </h1>
        <h5>
            Deze kaart geeft een overzicht van Gent met daarop het aantal fietsdiefstallen per wijk.
            Door de slider te activeren krijg je een overzicht van waar het grootste aantal parkeerplaatsen zijn voor fietsen.
        </h5>
        <BikeMap :all-features="allFeaturesWithoutUnknown"
                 :quarter-geometry-small="quarterGeometrySmall"
                 :bike-parking-per-quarter="bikeParkingPerQuarter"
                 :quarter-geometry-data="quarterGeometryDataWithoutUnknown"/>
        <h1>
            Misdrijven per categorie
        </h1>
        <h5>
            Deze kaart geeft een overzicht van het aantal misdrijven van een bepaalde categorie, deze categorie kan je selecteren in de dropdown.
            Door de slider te activeren zal de data genormaliseerd worden ten opzichte van het aantal inwoners in de wijk.
        </h5>
        <TotalCrimesMap :all-features="allFeaturesWithoutUnknown"
                        :quarter-geometry-small="quarterGeometrySmall"
                        :quarter-geometry-data="quarterGeometryDataWithoutUnknown"
                        :crime-types="crimeTypes"
                        :number-of-residents-per-quarter-map="numberOfResidentsPerQuarterMap"/>
    </div>
</template>

<style scoped>

</style>