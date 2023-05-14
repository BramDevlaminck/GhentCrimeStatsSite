import * as d3 from "d3";
/*
Define some colours scales we will use from this repository: https://github.com/d3/d3-scale-chromatic
*/
export default function colourScales(newMin, newMax) {
    function scaleToInterval(currentVal) {
        return currentVal * (newMax - newMin) + newMin;
    }

    function linearScaleColour(count, maxCount) {
        const rawColour = maxCount === 0 ? 0 : count / maxCount;

        // interpolateBlues expect a number between [0, 1]
        return d3.interpolateBlues(scaleToInterval(rawColour));
    }
    
    //create an interpolator based on interpolateBlues
    function interpolateBluesMod(value){
        return d3.interpolateBlues(scaleToInterval(value));
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


    // change is the improvement/worsening,
    // maxPosChange is the value that should be completely red,
    // maxNegChange is the value that should be completely green
    function differentialColour(change, maxNegChange, maxPosChange) {
        let fraction = 0.5;
        if (change > 0) {
            fraction = 0.5 - change / (maxPosChange * 2);
        } else if (change < 0) {
            fraction = 0.5 + change / (maxNegChange * 2);
        }
        return d3.interpolateRdYlGn(fraction);
    }

    return {
        scaleToInterval,
        linearScaleColour,
        interpolateBluesMod,
        categoricalScaleColour,
        differentialColour
    };
}