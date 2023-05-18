import * as d3 from "d3";
import {createTooltip} from "./D3Functions";
import colourScales from "./ColourScales";

const WIDTH = window.innerWidth / 4;
const HEIGHT = window.innerHeight / 2;
const HOVER_COLOR = "#db5252";
const {linearScaleColour, interpolateBluesMod} = colourScales(0.07, 1.0);


export function createMap(id, width, height) {
    const mapSvg = d3
        .select(id)
        .append("svg")
        .attr("width", "25vw")
        .attr("height", "50vh");

    const g = mapSvg.append("g");
    g.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr(
            "transform",
            `translate(-${width},-${height})`
        )
        .style("fill", "none")
        .style("pointer-events", "all");

    return { mapSvg, g }
}

export function drawMap(g, data, path, fillFunction) {
    return g.append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", fillFunction)
        .attr("stroke", "#FFF")
        .attr("stroke-width", 0.5)
}