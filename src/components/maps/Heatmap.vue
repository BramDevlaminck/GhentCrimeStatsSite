<template>
    <div id="textChartWrapper">
        <div id="chartWrapper">
            <div id="heatmap"/>
        </div>
        <div>
            <h5>Zwaktes</h5>
            <p>
                De <b>binnenstad</b> scoort over het algemeen slecht.
                Dit valt te verklaren aan het feit dat er gewoonweg erg veel geregistreerde feiten zijn in deze
                omgeving.
                De vele aanwezige <b>toeristen</b> en <b>studenten</b> kunnen hier een verklaring voor zijn.
                Van de zowat 80 000 studenten die in Gent studeren hebben enkele duizenden hier hun <b>kot</b>,
                bovendien ligt ook een groot stuk van de <b>campussen</b> in deze regio.
                Van de 37 campussen van hoge scholen en universiteiten in en rond Gent lagen er 14 in deze wijk <span
                    class="source">(<a href="https://github.com/BramDevlaminck/DatavisualisationPreprocessing">bron</a>)</span>.
                Verder worden studenten die hier een kot hebben worden niet meegeteld in het aantal inwoners.
                Dit gaat zorgen voor een verkeerd beeld van het aantal personen die effectief verblijven in deze wijk.
                Tot slot kunnen we ook drukke <b>uitgaansbuurten</b> zoals de Overpoort terugvinden in deze regio.
                Dit allemaal draagt bij tot het hoge aantal geregistreerde feiten ten opzichte van het aantal inwoners
                <span class="source">(<a href="https://hoeveelin.stad.gent/wijken/binnenstad/">bron</a>)</span>.
            </p>
            <p>
                Bij de Gentse Kanaaldorpen en -zone valt te zien dat er veel <b>verkeersongevallen met lichamelijke
                letsels</b> zijn vergeleken met het aantal inwoners.
                Dit valt deels te verklaren door de erg <b>dunne bevolkingsdichtheid</b>, terwijl het
                oppervlak van deze regio wel groot is.
                Een andere belangrijke reden is de ligging bij de <b>havens</b> (en de bijbehorende industrie).
                Hierdoor is er erg veel <b>doorgaand vrachtverkeer</b>, met als gevolg meerdere drukke en onveilige
                verbindingen/knooppunten <span class="source">(<a
                    href="https://hoeveelin.stad.gent/wijken/kanaaldorpen-en-kanaalzone/">bron</a>)</span>.
            </p>
            <p>
                De wijken <i>Watersportbaan - Ekkergem</i> en <i>Elisabethbegijnhof - Prinsenhof - Papegaai -
                Sint-Michiels</i>
                vertonen naast de binnenstad een hoog aantal geregistreerde voorvallen in verhouding met het aantal
                inwoners.
                Zeker als we dit vergelijken met de andere wijken zien we hier erg veel geel en rood. De <b>eerste regio
                bevat de Blaarmeersen en Watersportbaan</b>.
                Dit zijn allebei populaire plaatsen in Gent. Zeker in de Blaarmeersen kan het erg druk worden in de zomer <span
                    class="source">(<a
                    href="https://www.vrt.be/vrtnws/nl/2022/06/27/gent-zet-camera-s-in-op-blaarmeersen-om-in-te-grijpen-bij-te-gro/">bron</a>)</span>.
                Deze <b>tweede wijk ligt vlak bij de binnenstad</b> en bevat campussen zoals deze van LUCA School of
                Arts.
                Enkele van de meest gekende adresjes in Gent zijn hier ook terug te vinden zoals, De Kastart, Bocca, De
                Gekroonde Hoofden,…
                Ook hier is dus een gelijkaardige verklaring als voor het hoge aantal feiten in de binnenstad.
                De extra drukte van studenten en toeristen die hier zijn om te overnachten of ontspannen heeft een zichtbare
                invloed <span class="source">(<a href="https://hoeveelin.stad.gent/wijken/elisabethbegijnhof-papegaai/">bron</a>)</span>.
            </p>
            <h5>Sterktes</h5>
            <p>
                De wijken Oostakker, sint-amandsberg, Moscou-vogelhoek, Zwijnaarde, Mariakerke, Drongen en Wondelgem vertonen in
                het algemeen een erg lage hoeveelheid geregistreerde feiten ten opzichte van hun aantal inwoners.
                Deze liggen allemaal wat <b>verder van het stadscentrum</b> .
                Toerisme is hier niet veelvoorkomend en voor de meeste studenten is dit te ver van hun campussen om hier
                een kot te zoeken.
            </p>
        </div>
    </div>
</template>

<script>
import * as d3 from "d3";
import colourScales from '../ColourScales';

const {differentialColour} = colourScales();

const WIDTH = window.innerWidth / 2.5;


function transformToHeatmapData(data, crimes, quarters, populationPerQuarter) {
    // initialise a map with as key a quarter, and a value a map that has as key a crime and as value an array of all the totals for that crime in that quarter
    const totalsPerQuarterPerCrime = new Map();
    for (const quarter of quarters) {
        const totalPerCrime = new Map();
        for (const crime of crimes) {
            totalPerCrime.set(crime, []);
        }
        totalsPerQuarterPerCrime.set(quarter, totalPerCrime);
    }

    // put the data in the map
    for (const entry of data) {
        const properties = entry["properties"];
        const quarter = properties["quarter"];
        const count = properties["total"];
        const crime = properties["fact_category"];
        totalsPerQuarterPerCrime.get(quarter).get(crime).push(count);
    }

    // calculate weighted averages with the number of residents in a quarter
    const weightedAveragesPerQuarterPerCrime = new Map();
    for (const quarter of quarters) {
        const numberOfResidents = populationPerQuarter.get(quarter);
        const totalsForQuarter = totalsPerQuarterPerCrime.get(quarter);
        const weightedCrimeMap = new Map();
        for (const crime of crimes) {
            const allValues = totalsForQuarter.get(crime);
            const average = allValues.reduce((partialSum, value) => partialSum + value, 0) / allValues.length;
            const weightedAverage = average / numberOfResidents;
            weightedCrimeMap.set(crime, weightedAverage);
        }
        weightedAveragesPerQuarterPerCrime.set(quarter, weightedCrimeMap);
    }

    // calculate the average over all the quarters per crime
    const totalsPerCrime = new Map();
    for (const crime of crimes) {
        totalsPerCrime.set(crime, []);
    }
    for (const quarter of quarters) {
        const averagesForQuarter = weightedAveragesPerQuarterPerCrime.get(quarter);
        for (const crime of crimes) {
            totalsPerCrime.get(crime).push(averagesForQuarter.get(crime));
        }
    }
    const averagePerCrime = new Map();
    for (const crime of crimes) {
        const allValues = totalsPerCrime.get(crime);
        const average = allValues.reduce((partialSum, value) => partialSum + value, 0) / allValues.length;
        averagePerCrime.set(crime, average);
    }

    // calculate the biggest decrease and increase compared to the average over all the quarters per crime
    let biggestNegativeChangeMap = new Map();
    let biggestPositiveChangeMap = new Map();
    for (const crime of crimes) {
        biggestNegativeChangeMap.set(crime, Infinity);
        biggestPositiveChangeMap.set(crime, -Infinity);
    }
    for (const quarter of quarters) {
        const averagesForQuarter = weightedAveragesPerQuarterPerCrime.get(quarter);
        for (const crime of crimes) {
            const totalAverage = averagePerCrime.get(crime);
            const quarterAverage = averagesForQuarter.get(crime);
            const diff = quarterAverage - totalAverage;
            if (diff <= 0 && diff < biggestNegativeChangeMap.get(crime)) {
                biggestNegativeChangeMap.set(crime, diff);
            }
            if (diff >= 0 && diff > biggestPositiveChangeMap.get(crime)) {
                biggestPositiveChangeMap.set(crime, diff);
            }
        }
    }

    // create the result array by combining all the data
    const result = [];
    for (const quarter of quarters) {
        const averagesForQuarter = weightedAveragesPerQuarterPerCrime.get(quarter);
        const totalsForQuarter = totalsPerQuarterPerCrime.get(quarter);
        for (const crime of crimes) {
            result.push({
                "totalAverage": averagePerCrime.get(crime),
                "quarterAverage": averagesForQuarter.get(crime),
                "numberOfIncidentsInQuarter": totalsForQuarter.get(crime).reduce((partialSum, value) => partialSum + value, 0),
                "populationInQuarter": populationPerQuarter.get(quarter),
                "quarter": quarter,
                "crime": crime,
                "maxPosChange": biggestPositiveChangeMap.get(crime),
                "maxNegChange": biggestNegativeChangeMap.get(crime)
            });
        }
    }

    return result;

}

export default {
    props: {
        allFeatures: Array,
        crimeTypes: Set,
        residentsPerQuarter: Map
    },
    name: "Heatmap",
    mounted() {
        const quarters = [...this.residentsPerQuarter.keys()];
        const crimes = [...this.crimeTypes];
        // set the dimensions and margins of the graph
        const margin = {top: 350, right: 25, bottom: 25, left: 250},
            width = WIDTH - margin.left - margin.right,
            height = WIDTH - 0.05*WIDTH - margin.top - margin.bottom;

        // append the svg object to the body of the page
        const svg = d3.select("#heatmap")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
        const dataInHeatmapFormat = transformToHeatmapData(
            this.allFeatures,
            crimes,
            quarters,
            this.residentsPerQuarter
        );


        // Build X scales and axis:
        const x = d3.scaleBand()
            .range([0, width])
            .domain(quarters)
            .padding(0.05);
        svg.append("g")
            .style("font-size", 80 + "%")
            .call(d3.axisBottom(x).tickSize(0))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "start")
            .select(".domain").remove();

        // Build Y scales and axis:
        const y = d3.scaleBand()
            .range([height, 0])
            .domain(crimes)
            .padding(0.05);
        svg.append("g")
            .style("font-size", 80 + "%")
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain").remove();

        // create a tooltip
        const tooltip = d3.select("#heatmap")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("position", "absolute");

        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function (event, _) {
            tooltip
                .style("opacity", 1);
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1);
        };
        const mousemove = function (event, d) {
            const quarter = d.quarter;
            const count = d.numberOfIncidentsInQuarter;
            const crime = d.crime;

            tooltip
                .html("Regio: " + quarter + "<br>Geregistreerd feit: " + crime + "<br>Aantal geregistreerde voorvallen: " + count)
                .style("left", ((event.pageX) + 20) + "px")
                .style("top", (event.pageY) + "px");
        };
        const mouseleave = function (event, _) {
            tooltip
                .style("opacity", 0);
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8);
        };

        // add the squares
        svg.selectAll()
            .data(dataInHeatmapFormat)
            .join("rect")
            .attr("x", d => x(d.quarter))
            .attr("y", d => y(d.crime))
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function (d) {
                const avg = d.totalAverage;
                const quarterValue = d.quarterAverage;
                const maxPosChange = d.maxPosChange;
                const maxNegChange = d.maxNegChange;
                return differentialColour(quarterValue - avg, maxNegChange, maxPosChange);
            })
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    },
    beforeUnmount() {
        // remove all the data we add just before we unmount! otherwise the graphs will be duplicated
        d3.selectAll('#heatmap svg').remove();
    }
};
</script>

<style scoped>

</style>