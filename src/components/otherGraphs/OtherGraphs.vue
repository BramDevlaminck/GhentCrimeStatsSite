<script>
import YearOverviewGraph from "@/components/otherGraphs/YearOverviewGraph.vue";

export default {
    components: {YearOverviewGraph},
    props: {
        combinedData: Array
    },
    name: "OtherGraphs"
};
</script>

<template>
    <div>
        <YearOverviewGraph :combinedData="combinedData"/>
    </div>
</template>

<style scoped>

</style>