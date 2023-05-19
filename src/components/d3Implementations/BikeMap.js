import colourScales from "../ColourScales";
import {D3ToggleMap} from "./D3MapFunctions";

const {linearScaleColour} = colourScales(0.07, 1.0);

class BikeMap extends D3ToggleMap {
    constructor(id, allFeatures, quarterGeometrySmall, quarterGeometryData, numberOfResidentsPerQuarterMap) {
        super(id, "#mapToggle", allFeatures, quarterGeometrySmall, false, quarterGeometryData, numberOfResidentsPerQuarterMap, "Aantal Plaatsen", "Aantal Diefstallen");
    }

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
        const maxBikeParkings = Math.max(...[...totalCounts.keys()].map(quarter => totalPerQuarter.get(quarter)));

        // create the result array in the right format and return it
        const result = [];
        for (const [quarter, total] of totalCounts) {
            result.push({
                properties: {
                    "quarter": quarter,
                    "count": total,
                    "max": maxCount,
                    "max_bike_parkings": maxBikeParkings,
                    "number_of_parkings": totalPerQuarter.get(quarter)
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
        const numberOfParkings = properties.number_of_parkings;
        this.tooltip
            .html("Regio: " + quarter + "<br>Aantal fietsdiefstallen: " + count + "<br>Aantal plaatsen in fietsenstallingen: " + numberOfParkings)
            .style("left", ((event.pageX) + 20) + "px")
            .style("top", (event.pageY) + "px");
    }

    getInfoForColouringMap(data, conditional) {
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

    colorMap(d, _) {
        const [count, max] = this.getInfoForColouringMap(d, this.isToggled);
        return linearScaleColour(count, max);
    }

    getCurrentMax() {
        this.maxBikes = Math.max(...this.dataInMapFormat.map(entry => this.getInfoForColouringMap(entry, true)[1]));
        this.maxThefts = Math.max(...this.dataInMapFormat.map(entry => this.getInfoForColouringMap(entry, false)[1]));
        return this.isToggled ? this.maxBikes : this.maxThefts;
    }

    updateAndCalcLegendAxis(isToggled) {
        this.updateLegendAxis(isToggled ? this.maxBikes : this.maxThefts)
    }
}
