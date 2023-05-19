<script>
import * as d3 from "d3";
import {TotalCrimeMap} from "../d3Implementations/TotalCrimesMap";

export default {
    props: {
        allFeatures: Array,
        quarterGeometrySmall: Object,
        quarterGeometryData: Map,
        crimeTypes: Set,
        numberOfResidentsPerQuarterMap: Map
    },
    name: "TotalCrimesMap",
    mounted() {
        const allFeatures = this.allFeatures;
        const quarterGeometrySmall = this.quarterGeometrySmall;
        const crimeTypes = this.crimeTypes;
        const quarterGeometryData = this.quarterGeometryData;
        const numberOfResidentsPerQuarterMap = this.numberOfResidentsPerQuarterMap;

        new TotalCrimeMap("#totalMapContainer", allFeatures, quarterGeometrySmall, quarterGeometryData, numberOfResidentsPerQuarterMap, crimeTypes);

    },
    beforeUnmount() {
        // remove all the data we add just before we unmount! otherwise the graphs will be duplicated
        d3.selectAll('#totalMapContainer svg').remove();
        d3.selectAll('#selectButtonTotalCrimes option').remove();

    }
};
</script>

<template>
    <div id="textChartWrapper">
        <div id="text-next-to-slider">
            <p>
                Ook hier zien we vooral veel geregistreerde feiten in de <b>binnenstad</b>.
                Dit valt te verwachten aangezien hier veel studenten en toeristen terug te vinden zijn.
                Dit zorgt voor een grote drukte en dus ook een grotere kans op mensen die verkeerd parkeren, ongevallen
                die gebeuren, zakkenrollers die buit kunnen maken,…
            </p>
            <p>
                Als we ons focussen op de wijken rond de binnenstad valt vooral de wijk <b>Brugse Poort - Rooigem</b>
                op.
                Deze heeft duidelijk meer <b>geregistreerde feiten dan de omliggende wijken</b>.
                Dit blijkt een erg <b>dicht bebouwde</b> wijk te zijn (bebouwingsgraad van 26.5% terwijl het gemiddelde
                in Gent 13.3% is).
                Bovendien is het een cultureel multi-diverse wijk waar mensen vaak slechts enkele jaren wonen.
            </p>
            <p>
                <b>50% van de inwoners in deze wijk geeft aan dat ze vaak buurthinder ondervinden</b>.
                Vooral klachten over vuiligheid en veiligheid blijken veelvoudig voor te komen <span class="source">(<a
                    href="https://hoeveelin.stad.gent/wijken/brugse-poort-rooigem/">bron</a>)</span>.
            </p>
            <ul>
                <li>1/5 geeft aan bewust plekken in hun buurt te vermijden</li>
                <li>1/3 geeft meldingen over drugs-dealing en gebruik</li>
                <li>7/10 klaagt over zwerfvuil, sluikstorten en hondenpoep</li>
            </ul>
            <p>
                Onze data bevestigt dit ook (selecteer zelf de juiste categorie(ën) om dit te zien).
                Zo valt bijvoorbeeld te zien dat er een verhoogde last is van.
            </p>
            <ul>
                <li>Sluikstorten</li>
                <li>Bromfiets- en motordiefstal</li>
                <li>Diefstal gewapenderhand</li>
                <li>Diefstal uit of aan voertuigen</li>
            </ul>
            <p>
                Deze wijk is duidelijk geen rustige buurt om te wonen. Het is echter belangrijk dit in context te
                plaatsen van het aantal inwoners.
                <b>Wanneer we de data normaliseren naar het aantal inwoners blijkt dit niet uitzonderlijk hoog te
                    zijn</b>. Dit is zelfs vergelijkbaar met de omliggende wijken.
                Dit kunt u zelf nagaan door de toggle boven de grafiek te gebruiken.
            </p>
        </div>

        <div id="chartWrapper">
            <div id="toggleDiv">
                <!-- Rounded switch -->
                <label class="switch">
                    <input type="checkbox" id="totalCrimesMapToggle">
                    <span class="slider round"></span>
                </label>
                <p id="currentlyShowing">Normaliseer data met aantal inwoners in deze wijk</p>
            </div>
            <select id="selectButtonTotalCrimes"></select>
            <div id="totalMapContainer"/>
        </div>

    </div>
</template>


<style scoped>
/* The switch - the box around the slider */
.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

/* The slider */
.slider {
    position: absolute;
    cursor: pointer;
    width: 60px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
}

input:checked + .slider {
    background-color: #2196F3;
}

input:focus + .slider {
    box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
    border-radius: 34px;
}

.slider.round:before {
    border-radius: 50%;
}


#toggleDiv {
    display: flex;
    flex-direction: row;
    column-gap: 1em;
    align-items: center;
}

#currentlyShowing {
    margin: 0;
}
</style>