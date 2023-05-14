<script>
import * as d3 from "d3";
import colourScales from '../ColourScales';

const {linearScaleColour, interpolateBluesMod} = colourScales(0.07, 1.0);

const WIDTH = window.innerWidth / 4;
const HEIGHT = window.innerHeight / 2;
const HOVER_COLOR = "#db5252";

// transform the data to the format we use for the map
function dataToMapDataFormat(data, quarterGeometryData, numberOfResidentsPerQuarterMap) {
    // count how often something happened per quarter
    const totalCounts = new Map();
    for (const quarter of quarterGeometryData.keys()) {
        totalCounts.set(quarter, 0);
    }

    data.forEach(obj => {
        const quarter = obj["quarter"];
        const currentCount = totalCounts.get(quarter);
        totalCounts.set(quarter, currentCount + obj["total"]);
    });

    // get the max this happens per quarter
    const maxCount = Math.max(...totalCounts.values());
    const maxNumberOfRelativeCrimesPerQuarter = Math.max(...[...totalCounts.keys()]
        .map(quarter => totalCounts.get(quarter) / numberOfResidentsPerQuarterMap.get(quarter))
    );

    // create the result array in the right format and return it
    const result = [];
    for (const [quarter, total] of totalCounts) {
        const numberOfResidents = numberOfResidentsPerQuarterMap.get(quarter);
        result.push({
            properties: {
                "quarter": quarter,
                "count": total,
                "max": maxCount,
                "numberOfResidents": numberOfResidents,
                "relativeCrimesPerQuarter": total / numberOfResidents,
                "maxNumberOfRelativeCrimesPerQuarter": maxNumberOfRelativeCrimesPerQuarter
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
        count = properties.relativeCrimesPerQuarter;
        maxCount = properties.maxNumberOfRelativeCrimesPerQuarter;
    } else {
        count = properties.count;
        maxCount = properties.max;
    }
    return [count, maxCount];
}


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
        let showDataRelativePerNumberOfResidents = false;

        let dataInMapFormat = dataToMapDataFormat(allFeatures, quarterGeometryData, numberOfResidentsPerQuarterMap);

        const mapSvg = d3
            .select("#totalMapContainer")
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
            .style("opacity", 0)
            .attr("class", "tooltip")
            .attr("class", "tab")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("position", "absolute");

        //--------------------- dropdown ----------------------------------------

        const allCategories = ["Alle Categorieën"].concat([...crimeTypes]);

        // Function to update the map if a new crime category is chosen
        function updateMapWithNewCrimeCategory(selectedGroup) {
            let features = allFeatures;

            // select the data from the chart that we actually want/need
            if (selectedGroup !== allCategories[0]) {
                features = features.filter(element => {
                    return element["fact_category"] === selectedGroup;
                });
            }

            dataInMapFormat = dataToMapDataFormat(features, quarterGeometryData, numberOfResidentsPerQuarterMap);
            // plot the changed map
            map.data(dataInMapFormat)
                .attr("fill", (d, _) => {
                    const [count, maxCount] = getInfoForColouringMap(d, showDataRelativePerNumberOfResidents);
                    return linearScaleColour(count, maxCount);
                });
        }

        // add the options to the button
        d3.select("#selectButtonTotalCrimes")
            .selectAll('myOptions')
            .data(allCategories)
            .enter()
            .append('option')
            .text(function (d) {
                return d;
            }) // text showed in the menu
            .attr("value", function (d) {
                return d;
            }); // corresponding value returned by the button

        
        // LEGEND
                
        const barheight = 100;
        const barwidth = 15;

        const barX = 10;
        const barY = 50;

        let currentMax =  Math.max(...dataInMapFormat.map(entry => getInfoForColouringMap(entry, showDataRelativePerNumberOfResidents)[1]));

        // Linear scale for y-axis
        const yColourScale = d3
            .scaleLinear()
            .domain([0, currentMax])
            .range([barheight, 0]);

        //call this when changing the category (and changing the yColourScale.domain)
        const yColourAxis = d3.axisRight(yColourScale);

        const colourAxisTicks = yColourScale.ticks(4);
        colourAxisTicks.push(currentMax);
        yColourAxis.tickValues(colourAxisTicks);

        const colorScale = d3
            .scaleSequential(interpolateBluesMod)
            .domain([0, currentMax])

        //ticks needed to create the colour gradient (these are not for the axis)
        const colourticks = colorScale.ticks().concat(colorScale.domain()[1]);

        function createColorScaleLegend(root, x, y, width, height, ticks) {

            root.append("g")
                .attr("class", "colourAxis")
                .attr("transform", `translate(${x + width},${y})`)
                .call(yColourAxis)
                .select(".domain")
                .attr("visibility", "hidden");

            const defs = root.append('defs');

            const grad = defs.append('linearGradient')
                .attr('id', "linear-gradient")
                .attr('x1', '0%')
                .attr('x2', '0%')
                .attr('y1', '100%')
                .attr('y2', '0%');

            grad.selectAll('stop')
                .data(ticks.map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: colorScale(t) })))
                .enter()
                .append('stop')
                .style('stop-color', (d) => d.color)
                .attr('offset', (d) => d.offset);

            root.append('rect')
                .attr('x', x)
                .attr('y', y)
                .attr('width', width)
                .attr('height', height)
                .style('fill', 'url(#linear-gradient)');
        }

        createColorScaleLegend(mapSvg, barX, barY, barwidth, barheight, colourticks);
        mapSvg.append("text")
            .attr("y", barY - 20)
            .attr("x", barX)
            .text("Legende: Aantal Feiten")
            .attr("font-weight", 500)
            .attr("class", "legend")
            .style("font-size", "80%");

        function updateLegendAxis(currentMax) {
            yColourScale.domain([0, currentMax]);

            const colourAxisTicks = yColourScale.ticks(4);
            
            if ((currentMax - colourAxisTicks[colourAxisTicks.length-1])/(colourAxisTicks[colourAxisTicks.length-1] - colourAxisTicks[colourAxisTicks.length-2]) < 0.15) {
                colourAxisTicks.pop();
            }
            colourAxisTicks.push(currentMax);
            yColourAxis.tickValues(colourAxisTicks); 

            mapSvg.select('.colourAxis')
                .transition()
                .call(yColourAxis);
        }

        // Listen to dropdown
        d3.select("#selectButtonTotalCrimes").on("change", function (_) {
            updateMapWithNewCrimeCategory(this.value);
            const currentMax =  Math.max(...dataInMapFormat.map(entry => getInfoForColouringMap(entry, showDataRelativePerNumberOfResidents)[1]));
            updateLegendAxis(currentMax);
        });


        // -------------------------- effect handlers for the map -----------------
        function mouseOverHandler(event, _) {
            d3.select(this).attr("fill", HOVER_COLOR);
            tooltip.style("opacity", 1);
        }

        function mouseMoveHandler(event, data) {
            updateTooltip(event, data);
        }

        function mouseOutHandler(event, data) {
            const [count, max] = getInfoForColouringMap(data, showDataRelativePerNumberOfResidents);
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
            const numberOfResidents = properties.numberOfResidents;
            tooltip
                .html("Regio: " + quarter + "<br>Aantal inwoners: " + numberOfResidents + "<br>Aantal geregistreerde voorvallen: " + count)
                .style("left", ((event.pageX) + 20) + "px")
                .style("top", (event.pageY) + "px");
        }

        // --------------------- projection and path ----------------------------
        const projection = d3.geoMercator()
            .fitExtent([[20, 20], [WIDTH - 20, HEIGHT - 20]], quarterGeometrySmall);
        const path = d3.geoPath().projection(projection);


        // ---------------------------------- draw graph ------------------------------------
        // Draw districts and register event listeners
        const map = g.append("g")
            .selectAll("path")
            .data(dataInMapFormat)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", (d, _) => {
                const properties = d["properties"];
                const count = properties.count;
                const max = properties.max;
                return linearScaleColour(count, max);
            })
            .attr("stroke", "#FFF")
            .attr("stroke-width", 0.5)
            .on("mouseover", mouseOverHandler)
            .on("mousemove", mouseMoveHandler)
            .on("mouseout", mouseOutHandler)
            .on("click", clickHandler);
        

        // listen to toggle
        d3.select("#totalCrimesMapToggle").on("change", function (_) {
            showDataRelativePerNumberOfResidents = d3.select("#totalCrimesMapToggle").property("checked");
            currentMax = Math.max(...dataInMapFormat.map(entry => getInfoForColouringMap(entry, showDataRelativePerNumberOfResidents)[1]));

            updateLegendAxis(currentMax);

            map.data(dataInMapFormat)
                .attr("fill", (d, _) => {
                    const [count, max] = getInfoForColouringMap(d, showDataRelativePerNumberOfResidents);
                    return linearScaleColour(count, max);
                });
            const legendText = showDataRelativePerNumberOfResidents? "Legende: Genormaliseerd Aantal Feiten" : "Legende: Aantal Feiten"
            mapSvg.select(".legend")
                .text(legendText)
        });
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
                Als we ons focussen op de wijken rond de binnenstad valt vooral de wijk <b>Brugse Poort - Rooigem</b> op.
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