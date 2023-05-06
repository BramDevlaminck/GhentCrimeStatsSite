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
            <div class="segment left">
                <h3>Lorem ipsum</h3>
                <p>Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.</p>
            </div>
            <div class="segment right">
                <h3>Lorem ipsum</h3>
                <p>Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.</p>
            </div>
            <div class="segment left">
                <h3>Lorem ipsum</h3>
                <p>Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.</p>
            </div>
            <div class="segment right">
                <h3>Lorem ipsum</h3>
                <p>Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.left {
    left: 0;
}

.right {
    left: 50%;
}

.timeline {
    position: relative;
}

.timeline::after {
    content: '';
    position: absolute;
    width: 4px;
    background-color: gray;
    top: 0;
    bottom: 0;
    left: 50%;
}

.segment {
    position: relative;
    width: 50%;
    padding: 1rem;
}

.segment::after {
    content: '';
    position: absolute;
    top: 0;
    right: -10px;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: dimgrey;
    z-index: 1;
}

.right::after {
    left: -5.3px;
}

@media screen and (max-width: 768px){
    .right {
        left: 0;
    }

    .right::after {
        left: 0;
    }

    .left::after {
        right: auto;
        left: 0;
    }

    .timeline::after {
        left: 5px;
    }

    .segment {
        width: 100%;
    }
}

</style>