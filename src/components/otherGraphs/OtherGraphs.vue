<script>
import TotalLineChart from "@/components/otherGraphs/TotalLineChart.vue";
import TotalBarChart from "@/components/otherGraphs/TotalBarChart.vue";
import YearlyCompareBarChart from "./YearlyCompareBarChart.vue";

export default {
    components: {YearlyCompareBarChart, TotalBarChart, TotalLineChart},
    props: {
        combinedData: Array,
        crimeTypes: Set
    },
    name: "OtherGraphs"
};
</script>

<template>
    <div>
        <h1>
            Maandelijks overzicht per jaar
        </h1>
        <h5>
            Deze grafiek geeft een overzicht van het totaal aantal voorvallen van een misdrijf per maand en per jaar. <br>
            De dropdown kan gebruikt worden om een categorie te selecteren en door op de legende te klikken kunnen bepaalde jaren verborgen worden.
        </h5>
        <TotalLineChart :data="combinedData" :crime-types="crimeTypes"/>
        <h1>
            Maandelijks gemiddelde per jaar
        </h1>
        <h5>
            Deze grafiek geeft een overzicht van het gemiddeld aantal voorvallen van een misdrijf per maand en dat voor elk jaar. <br>
            De dropdown kan gebruikt worden om een categorie te selecteren.
        </h5>
        <TotalBarChart :all-features="combinedData" :crime-types="crimeTypes"/>
        <h1>
            Totaal aantal voorvallen per categorie
        </h1>
        <h5>
            Deze grafiek geeft het totaal aantal voorvallen per categorie weer. Je kan een categorie verbergen door erop te klikken. <br>
            De dropdown kan gebruikt worden om een jaar te selecteren.
        </h5>
        <YearlyCompareBarChart :all-features="combinedData" :crime-types="crimeTypes"/>
    </div>
</template>

<style scoped>

</style>