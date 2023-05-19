<script>
import * as d3 from "d3";
import {BikeMap} from "../d3Implementations/BikeMap";

export default {
    props: {
        bikeParkingPerQuarter: Map,
        allFeatures: Array,
        quarterGeometrySmall: Object,
        quarterGeometryData: Map
    },
    name: "BikeMap",
    mounted() {
        const allFeatures = this.allFeatures.filter(feature => feature["fact_category"] === "Fietsdiefstal");
        const quarterGeometrySmall = this.quarterGeometrySmall;
        const bikeParkingPerQuarter = this.bikeParkingPerQuarter;
        const quarterGeometryData = this.quarterGeometryData;

        new BikeMap("#bikeMapContainer", allFeatures, quarterGeometrySmall, quarterGeometryData, bikeParkingPerQuarter);
    },
    beforeUnmount() {
        // remove all the data we add just before we unmount! otherwise the graphs will be duplicated
        d3.selectAll('#bikeMapContainer svg').remove();
    }
};
</script>

<template>
    <div id="textChartWrapper">
        <div id="chartWrapper">
            <div id="toggleDiv">
                <!-- Rounded switch -->
                <label class="switch">
                    <input type="checkbox" id="mapToggle">
                    <span class="slider round"></span>
                </label>
                <p id="currentlyShowing">Kaartkleur aan de hand van aantal fietsenstallingen</p>
            </div>
            <div id="bikeMapContainer"/>
        </div>
        <div id="text-next-to-slider">
            <p>
                Zoals te verwachten is vooral in de <b>binnenstad</b> veel diefstal van fietsen.
                Er valt echter op dat er <b>geen verband</b> is tussen de plaats waar het <b>meeste diefstallen</b> (in
                de binnenstad) zijn en het <b>meeste fietsenstallingen</b> (stationsbuurt noord).
                Dit kan je zelf nagaan door de kleurschaal aan te passen aan de hand van de toggle boven de grafiek.
            </p>
            <p>
                We vermoeden dat dit te maken heeft met het feit dat fietsen in de fietsenstalling bij station Gent
                Sint-Pieters deels overdekt kunnen staan.
                In combinatie met het feit dat aan het station bijna altijd beweging is van andere pendelaars, studenten
                en politieagenten.
                In de binnenstad zijn dan wel veel fietsenstallingen, maar dit zijn vaak erg <b>kleine
                fietsenstallingen</b> die <b>verspreid</b> zijn doorheen het centrum.
                Ook zijn zeker niet al deze fietsenstallingen even druk bezocht, vaak zijn dit bv. 5 plaatsen langs de
                straat in een rustigere buurt of <b>hangen fietsen vast aan andere objecten</b>.
            </p>
            <p>
                Bovendien worden fietsen niet altijd aan de fietsenstallingen vastgemaakt.
                Zo'n <i>niet bestaande</i> fietsenstalling kan bijvoorbeeld <a
                    href="https://goo.gl/maps/73K9wmAtwmy2cKkS9">hier</a> teruggevonden worden.
                Volgens de dataset <span class="source">(<a
                    href="https://data.stad.gent/explore/dataset/fietsenstallingen-gent/table/">bron</a>)</span> is dit
                een fietsenstalling met een capaciteit van 2.
                Dit allemaal terwijl er veel fietsen zichtbaar zijn die vast hangen aan een rail, paaltjes,...
                (verken dit zeker zelf eens aan de hand van Google Streetview!)
            </p>
            <p>
                Dit komt omdat de bestaande fietsenstallingen vaak <b>vol</b> zitten, of omdat de dichtste
                fietsenstalling <b>niet vlakbij</b> het restaurantje,… is waar men wil zitten.
                In de stationsbuurt komt dit minder voor aangezien de meeste mensen die hun fiets hier willen plaatsen
                allemaal op dezelfde plaats moeten zijn: station Gent Sint-Pieters, de <b>grote fietsenstalling bij het
                station is dus ideaal gepositioneerd</b>.
            </p>
        </div>

    </div>
</template>


<style scoped>
</style>