<script>
import TotalLineChart from "@/components/otherGraphs/TotalLineChart.vue";

export default {
    components: {TotalLineChart},
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
    </div>
</template>

<style scoped>

</style>