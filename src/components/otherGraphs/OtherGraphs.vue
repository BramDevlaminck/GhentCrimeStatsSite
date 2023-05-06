<script>
import TotalLineChart from "@/components/otherGraphs/TotalLineChart.vue";
import TotalBarChart from "@/components/otherGraphs/TotalBarChart.vue";

export default {
    components: {TotalBarChart, TotalLineChart},
    props: {
        combinedData: Array,
        crimeTypes: Set
    },
    name: "OtherGraphs"
};
</script>

<template>
    <div>
        <TotalLineChart :data="combinedData" :crime-types="crimeTypes"/>
        <TotalBarChart :all-features="combinedData" :crime-types="crimeTypes"/>
    </div>
</template>

<style scoped>

</style>