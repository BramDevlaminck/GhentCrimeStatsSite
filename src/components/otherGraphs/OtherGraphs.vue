<script>
import YearOverviewGraph from "@/components/otherGraphs/YearOverviewGraph.vue";
import TotalLineChart from "@/components/otherGraphs/TotalLineChart.vue";

export default {
    components: {TotalLineChart, YearOverviewGraph},
    props: {
        combinedData: Array
    },
    name: "OtherGraphs"
};
</script>

<template>
    <div>
        <YearOverviewGraph :combinedData="combinedData"/>
        <TotalLineChart :data="combinedData" />
    </div>
</template>

<style scoped>

</style>