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
        <div class="timeline">
            <div class="empty-block">
            </div>
            <div class="divider">
                <div class="circle"></div>
            </div>
            <div class="segment">
                <h3>Lorem ipsum</h3>
                <p>Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.</p>
            </div>
            <div class="segment">
                <h3>Lorem ipsum</h3>
                <p>Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.</p>
            </div>
            <div class="divider">
                <div class="circle"></div>
            </div>
            <div class="empty-block">
            </div>
            <div class="empty-block">
            </div>
            <div class="divider">
                <div class="circle"></div>
            </div>
            <div class="segment">
                <h3>Lorem ipsum</h3>
                <p>Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.</p>
            </div>
            <div class="segment">
                <h3>Lorem ipsum</h3>
                <p>Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.</p>
            </div>
            <div class="divider">
                <div class="circle"></div>
            </div>
            <div class="empty-block">
            </div>
        </div>
    </div>
</template>

<style scoped>
.timeline {
    width: 80%;
    height: auto;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
}

.timeline {
    display: grid;
    grid-template-columns: 1fr 3px 1fr;
}

.divider {
    position: relative;
    width: 3px;
    background-color: gray;
    height: 100%;
}

.circle {
    position: absolute;
    top: 0;
    left: 50%;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: gray;
    border-color: gray;
    border-width: 5px;
    transform: translateX(-50%);
}

.segment {
    margin: 1rem;
}

</style>