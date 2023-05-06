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
        quarterGeometrySmall: Object
    },
    name: "Maps"
};
</script>

<template>
    <div>
        <InteractiveMap :all-features="allFeaturesWithoutUnknown"
                        :begin-date="beginDate"
                        :end-date="endDate"
                        :crime-types="crimeTypes"
                        :quarter-geometry-data="quarterGeometryData"
                        :bike-parking-per-quarter="bikeParkingPerQuarter"
                        :quarter-geometry-data-without-unknown="quarterGeometryDataWithoutUnknown"
                        :quarter-geometry-small="quarterGeometrySmall"/>
        <BikeMap :all-features="allFeaturesWithoutUnknown"
                 :quarter-geometry-small="quarterGeometrySmall"
                 :bike-parking-per-quarter="bikeParkingPerQuarter"
                 :quarter-geometry-data="quarterGeometryDataWithoutUnknown"/>
        <TotalCrimesMap :all-features="allFeaturesWithoutUnknown"
                        :quarter-geometry-small="quarterGeometrySmall"
                        :quarter-geometry-data="quarterGeometryDataWithoutUnknown"
                        :crime-types="crimeTypes"/>
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

</style>