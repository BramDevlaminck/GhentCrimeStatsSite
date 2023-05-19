import colourScales from "../ColourScales";
import {D3ToggleMap} from "./D3MapFunctions";
import {createDropdown} from "../D3Functions";

const {linearScaleColour} = colourScales(0.07, 1.0);

export class TotalCrimeMap extends D3ToggleMap {
    constructor(id, allFeatures, quarterGeometrySmall, quarterGeometryData, numberOfResidentsPerQuarterMap, crimeTypes) {
        super(id, "#totalCrimesMapToggle", allFeatures, quarterGeometrySmall, false, quarterGeometryData, numberOfResidentsPerQuarterMap, "Genormaliseerd Aantal Feiten", "Aantal Feiten");
        this.crimeTypes = crimeTypes
        this.create();
        this.setDropDown();
    }

    // transform the data to the format we use for the map
    dataToMapFormat(data, quarterGeometryData, totalPerQuarter) {
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
            .map(quarter => totalCounts.get(quarter) / totalPerQuarter.get(quarter))
        );

        // create the result array in the right format and return it
        const result = [];
        for (const [quarter, total] of totalCounts) {
            const numberOfResidents = totalPerQuarter.get(quarter);
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

    updateTooltip(event, data) {
        const properties = data["properties"];
        const count = properties.count;
        const quarter = properties.quarter;
        const numberOfResidents = properties.numberOfResidents;
        this.tooltip
            .html("Regio: " + quarter + "<br>Aantal inwoners: " + numberOfResidents + "<br>Aantal geregistreerde voorvallen: " + count)
            .style("left", ((event.pageX) + 20) + "px")
            .style("top", (event.pageY) + "px");
    }

    getInfoForColouringMap(data, conditional) {
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

    colorMap(d, _) {
        const properties = d["properties"];
        const count = properties.count;
        const max = properties.max;
        return linearScaleColour(count, max);
    }

    getCurrentMax() {
        return Math.max(...this.dataInMapFormat.map(entry => this.getInfoForColouringMap(entry, this.isToggled)[1]));
    }

    updateAndCalcLegendAxis(isToggled) {
        this.currentMax = Math.max(...this.dataInMapFormat.map(entry => this.getInfoForColouringMap(entry, this.isToggled)[1]));

        this.updateLegendAxis(this.currentMax);
    }

    //--------------------- dropdown ----------------------------------------
    setDropDown() {
        this.allCategories = ["Alle Categorieën"].concat([...this.crimeTypes]);
        // add the options to the button
        createDropdown("#selectButtonTotalCrimes", this.allCategories, (value) => {
            this.changeCallback(value)
        });
    }

    updateMapWithNewCrimeCategory(selectedGroup) {
        let features = this.allFeatures;

        // select the data from the chart that we actually want/need
        if (selectedGroup !== this.allCategories[0]) {
            features = features.filter(element => {
                return element["fact_category"] === selectedGroup;
            });
        }

        this.dataInMapFormat = this.dataToMapFormat(features, this.quarterGeometryData, this.totalPerQuarter);
        // plot the changed map
        this.map.data(this.dataInMapFormat)
            .attr("fill", (d, _) => {
                const [count, maxCount] = this.getInfoForColouringMap(d, this.isToggled);
                return linearScaleColour(count, maxCount);
            });
    }

    changeCallback(value) {
        this.updateMapWithNewCrimeCategory(value);
        const currentMax = Math.max(...this.dataInMapFormat.map(entry => this.getInfoForColouringMap(entry, this.isToggled)[1]));
        this.updateLegendAxis(currentMax);
    }

}
