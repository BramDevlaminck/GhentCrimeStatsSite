<script>
import * as d3 from "d3";
import colourScales from '../ColourScales';

const {linearScaleColour} = colourScales();

// TODO: change this if needed? not really clean this way
const WIDTH = window.innerWidth / 4;
const HEIGHT = window.innerHeight / 2;
const HOVER_COLOR = "#d36f80";

// transform the data to the format we use for the map
function dataToMapDataFormat(data, bikeParkingPerQuarter, quarterGeometryData) {
    // count how often something happened per quarter
    const totalCounts = new Map();
    for (const quarter of quarterGeometryData.keys()) {
        totalCounts.set(quarter, 0);
    }

    data.forEach(obj => {
        const properties = obj["properties"];
        const quarter = properties["quarter"];
        const currentCount = totalCounts.get(quarter);
        totalCounts.set(quarter, currentCount + properties["total"]);
    });

    // get the max this happens per quarter
    const maxCount = Math.max(...totalCounts.values());
    const maxBikeParkings = Math.max(...[...totalCounts.keys()].map(quarter => bikeParkingPerQuarter.get(quarter)));

    // create the result array in the right format and return it
    const result = [];
    for (const [quarter, total] of totalCounts) {
        result.push({
            properties: {
                "quarter": quarter,
                "count": total,
                "max": maxCount,
                "max_bike_parkings": maxBikeParkings,
                "number_of_parkings": bikeParkingPerQuarter.get(quarter)
            },
            type: "Feature",
            geometry: quarterGeometryData.get(quarter)
        });
    }
    return result;
}

function getInfoForColouringMap(data, conditional) {
    const properties = data["properties"];
    let count;
    let maxCount;
    if (conditional) {
        count = properties.number_of_parkings;
        maxCount = properties.max_bike_parkings;
    } else {
        count = properties.count;
        maxCount = properties.max;
    }
    return [count, maxCount];
}

export default {
    props: {
        bikeParkingPerQuarter: Map,
        allFeatures: Array,
        quarterGeometrySmall: Object,
        quarterGeometryData: Map
    },
    name: "BikeMap",
    mounted() {
        let showNumberOfBikeParkings = false;
        const allFeatures = this.allFeatures.filter(feature => feature["properties"]["fact_category"] === "Fietsdiefstal");
        const quarterGeometrySmall = this.quarterGeometrySmall;
        const bikeParkingPerQuarter = this.bikeParkingPerQuarter;
        const quarterGeometryData = this.quarterGeometryData;

        const mapSvg = d3
            .select("#bikeMapContainer")
            .append("svg")
            .attr("width", "25vw")
            .attr("height", "50vh");

        const g = mapSvg.append("g");
        g.append("rect")
            .attr("width", WIDTH)
            .attr("height", HEIGHT)
            .attr(
                "transform",
                `translate(-${WIDTH},-${HEIGHT})`
            )
            .style("fill", "none")
            .style("pointer-events", "all");

        // --------------------------  create a tooltip --------------------
        const tooltip = d3.select("#mapContainer")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("position", "absolute");


        // -------------------------- effect handlers for the map -----------------
        function mouseOverHandler(event, _) {
            d3.select(this).attr("fill", HOVER_COLOR);
            tooltip.style("opacity", 1);
        }

        function mouseMoveHandler(event, data) {
            updateTooltip(event, data);
        }

        function mouseOutHandler(event, data) {
            const [count, max] = getInfoForColouringMap(data, showNumberOfBikeParkings);
            const selectedColor = linearScaleColour(count, max);
            d3.select(this).attr("fill", selectedColor);

            tooltip.style("opacity", 0);
        }

        function clickHandler(event, data) {
            updateTooltip(event, data);
        }

        function updateTooltip(event, data) {
            const properties = data["properties"];
            const count = properties.count;
            const quarter = properties.quarter;
            const numberOfParkings = properties.number_of_parkings;
            tooltip
                .html("Regio: " + quarter + "<br>Aantal fietsdiefstallen: " + count + "<br>Aantal plaatsen in fietsenstallingen: " + numberOfParkings)
                .style("left", ((event.pageX) + 20) + "px")
                .style("top", (event.pageY) + "px");
        }

        // --------------------- projection and path ----------------------------
        const projection = d3.geoMercator()
            .fitExtent([[20, 20], [WIDTH - 20, HEIGHT - 20]], quarterGeometrySmall);
        const path = d3.geoPath().projection(projection);


        // ---------------------------------- draw graph ------------------------------------
        // Draw districts and register event listeners
        const dataInMapFormat = dataToMapDataFormat(allFeatures, bikeParkingPerQuarter, quarterGeometryData);
        const map = g.append("g")
            .selectAll("path")
            .data(dataInMapFormat)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", (d, _) => {
                const [count, max] = getInfoForColouringMap(d, showNumberOfBikeParkings);
                return linearScaleColour(count, max);
            })
            .attr("stroke", "#FFF")
            .attr("stroke-width", 0.5)
            .on("mouseover", mouseOverHandler)
            .on("mousemove", mouseMoveHandler)
            .on("mouseout", mouseOutHandler)
            .on("click", clickHandler);

        // listen to toggle
        d3.select("#mapToggle").on("change", function (_) {
            showNumberOfBikeParkings = d3.select("#mapToggle").property("checked");
            map.data(dataInMapFormat)
                .attr("fill", (d, _) => {
                    const [count, max] = getInfoForColouringMap(d, showNumberOfBikeParkings);
                    return linearScaleColour(count, max);
                });
        });
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
                Er valt echter op dat er <b>geen verband</b> is tussen de plaats waar het <b>meeste diefstallen</b> (in de binnenstad) zijn en het <b>meeste fietsenstallingen</b> (stationsbuurt noord).
                Dit kan je zelf nagaan door de kleurschaal aan te passen aan de hand van de toggle boven de grafiek.
            </p>
            <p>
                We vermoeden dat dit te maken heeft met het feit dat fietsen in de fietsenstalling bij station Gent Sint-Pieters deels overdekt kunnen staan.
                In combinatie met het feit dat aan het station bijna altijd beweging is van andere pendelaars, studenten en politieagenten.
                In de binnenstad zijn dan wel veel fietsenstallingen, maar dit zijn vaak erg <b>kleine fietsenstallingen</b> die <b>verspreid</b> zijn doorheen het centrum.
                Ook zijn zeker niet al deze fietsenstallingen even druk bezocht, vaak zijn dit bv. 5 plaatsen langs de straat in een rustigere buurt of <b>hangen fietsen vast aan andere objecten</b>.
            </p>
            <p>
                Bovendien worden fietsen niet altijd aan de fietsenstallingen vastgemaakt.
                Zo'n <i>niet bestaande</i> fietsenstalling kan bijvoorbeeld <a href="https://goo.gl/maps/73K9wmAtwmy2cKkS9">hier</a> teruggevonden worden.
                Volgens de dataset (<a href="https://data.stad.gent/explore/dataset/fietsenstallingen-gent/table/">bron</a>) is dit een fietsenstalling voor 2 fietsen. Dit is niet alleen heel klein, maar op Google Streetview is hier niet eens een fietsenstalling zichtbaar.
                Er zijn echter wel veel fietsen zichtbaar die vast hangen aan een rail, paaltjes,...
                (verken dit zeker zelf eens aan de hand van Google Streetview!)
            </p>
            <p>
                Dit komt omdat de bestaande fietsenstallingen vaak <b>vol</b> zitten, of is de dichtste fietsenstalling <b>niet vlakbij</b> het restaurantje,… is waar men wil zitten.
                In de stationsbuurt is dit een minder probleem aangezien de meeste mensen die hun fiets hier willen plaatsen allemaal op dezelfde plaats moeten zijn: station Gent Sint-Pieters, de <b>grote fietsenstalling bij het station is dus ideaal gepositioneerd</b>.
            </p>
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