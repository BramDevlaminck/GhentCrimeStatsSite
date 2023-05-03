<script>
import TotalLineChart from "@/components/otherGraphs/TotalLineChart.vue";

export default {
    components: {TotalLineChart},
    props: {
        combinedData: Array
    },
    name: "OtherGraphs"
};
</script>

<template>
    <div>
        <TotalLineChart :data="combinedData"/>
    </div>
</template>

<style scoped>

</style>