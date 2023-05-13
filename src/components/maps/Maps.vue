<script>
import InteractiveMap from "@/components/maps/InteractiveMap.vue";
import TotalCrimesMap from "@/components/maps/TotalCrimesMap.vue";
import BikeMap from "@/components/maps/BikeMap.vue";
import Heatmap from "@/components/maps/Heatmap.vue";

export default {
    components: {Heatmap, BikeMap, TotalCrimesMap, InteractiveMap},
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
            Interactive kaart
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
            Kaart met fietsdiefstal
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
            Deze kaart geeft een overzicht van het aantal misdrijven van een bepaalde categorie over alle jaren heen. De gewenste categorie kan je selecteren via de dropdown.
            Door de slider te activeren zal de data genormaliseerd worden ten opzichte van het aantal inwoners in de wijk.
        </h5>
        <TotalCrimesMap :all-features="allFeaturesWithoutUnknown"
                        :quarter-geometry-small="quarterGeometrySmall"
                        :quarter-geometry-data="quarterGeometryDataWithoutUnknown"
                        :crime-types="crimeTypes"
                        :number-of-residents-per-quarter-map="numberOfResidentsPerQuarterMap"/>

        <h1>
            Heatmap van misdrijven per wijk
        </h1>
        <h5>
            Deze heatmap geeft een overzicht van het aantal misdrijven van een bepaalde categorie per regio.
            De kleuren zijn genormaliseerd per aantal inwoners. Dit geeft het effect dat een regio met veel inwoner meer registraties van een bepaald feit mag hebben voordat dit als slechter gezien wordt.
            Dit laat ons toe te zien welke regio's een uitzonderlijk hoog of laag aantal registraties hebben in verhouding met het aantal inwoners.
        </h5>
        <Heatmap :crime-types="crimeTypes" :all-features="allFeaturesWithoutUnknown" :residents-per-quarter="numberOfResidentsPerQuarterMap" />
    </div>
</template>

<style scoped>

</style>