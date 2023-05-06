import * as d3 from "d3";
/*
Define some colours scales we will use from this repository: https://github.com/d3/d3-scale-chromatic
*/
export default function colourScales() {
    function scaleToInterval(currentVal, newMin, newMax) {
        return currentVal * (newMax - newMin) + newMin;
    }

    function linearScaleColour(count, maxCount) {
        const rawColour = maxCount === 0 ? 0 : count / maxCount;

        // interpolateBlues expect a number between [0, 1]
        return d3.interpolateBlues(scaleToInterval(rawColour, 0.07, 1.0));
    }

    function categoricalScaleColour(domain) {
        const colours = [];
        const minInterval = 0.2;
        const maxInterval = 0.9;
        const stepSize = (maxInterval - minInterval) / domain.length;

        for (let i = 0; i < domain.length; i++) {
            colours.push(d3.interpolateViridis(minInterval + i * stepSize));
        }
        return d3.scaleOrdinal().domain(domain).range(colours);
    }


    // change is the improvement/worsening, maxWorsening is the value should be completely red, maxImprovement is what should be completely green
    function differentialColour(change, maxWorsening, maxImprovement) {
        // TODO: this is untested, so the scaling for what needs to be red or green can be totally off
        //  fraction == 0 => totally red
        //  fraction == 1 => totally green
        //  fraction == 0.5 => neutral colour
        let fraction = 0.5;
        if (change > 0) {
            fraction = 0.5 + change / (maxImprovement * 2);
        } else if (change < 0) {
            fraction = 0.5 - change / (maxWorsening * 2);
        }
        return d3.interpolateRdYlGn(fraction);
    }

    return {
        linearScaleColour,
        categoricalScaleColour
    };
}