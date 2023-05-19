import * as d3 from "d3";
import {createTooltip} from "../D3Functions";
import colourScales from "../ColourScales";

const HOVER_COLOR = "#db5252";
const {linearScaleColour, interpolateBluesMod} = colourScales(0.07, 1.0);


export function createMap(id, width, height) {
    const mapSvg = d3
        .select(id)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

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

    return {mapSvg, g}
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

export class D3Map {
    constructor(id, allFeatures, quarterGeometrySmall, quarterGeometryData, totalPerQuarter, text) {
        this.id = id;
        this.allFeatures = allFeatures;
        this.quarterGeometrySmall = quarterGeometrySmall;
        this.quarterGeometryData = quarterGeometryData;
        this.totalPerQuarter = totalPerQuarter;
        this.text = text;
    }

    create() {
        this.dataInMapFormat = this.dataToMapFormat(this.allFeatures, this.quarterGeometryData, this.totalPerQuarter);
        const {WIDTH, HEIGHT} = this.getWidthAndHeight();
        const {mapSvg, g} = createMap(this.id, WIDTH, HEIGHT);
        this.mapSvg = mapSvg;
        // --------------------------  create a tooltip --------------------
        this.tooltip = createTooltip("#mapContainer")

        // --------------------- projection and path ----------------------------
        const projection = d3.geoMercator()
            .fitExtent([[20, 20], [WIDTH - 20, HEIGHT - 20]], this.quarterGeometrySmall);
        this.path = d3.geoPath().projection(projection);

        // ---------------------------------- draw graph ------------------------------------
        // Draw districts and register event listeners
        this.map = drawMap(g, this.dataInMapFormat, this.path, this.colorMap.bind(this));

        this.map.on("mouseover", this.mouseOverHandler.bind(this))
            .on("mousemove", this.mouseMoveHandler.bind(this))
            .on("mouseout", this.mouseOutHandler.bind(this))
            .on("click", this.clickHandler.bind(this));

        // ---------------------------------- legend ------------------------------------
        this.createLegend();
    }

    getWidthAndHeight() {
        const WIDTH = window.innerWidth / 2;
        const HEIGHT = window.innerHeight / 2;
        return { WIDTH, HEIGHT };
    }

    dataToMapFormat(data, quarterGeometryData, totalPerQuarter) {
        throw "Abstract function is not implemented";
    }

    updateTooltip(event, data) {
        throw "Abstract function is not implemented";
    }

    getInfoForColouringMap(data) {
        throw "Abstract function is not implemented";
    }

    // -------------------------- effect handlers for the map -----------------
    mouseOverHandler(event, _) {
        d3.select(event.target).attr("fill", HOVER_COLOR);
        this.tooltip.style("opacity", 1);
    }

    mouseMoveHandler(event, data) {
        this.updateTooltip(event, data);
    }

    mouseOutHandler(event, data) {
        throw "Abstract function is not implemented";
    }

    clickHandler(event, data) {
        this.updateTooltip(event, data);
    }

    // ---------------------------------- draw graph ------------------------------------
    colorMap(d, _) {
        throw "Abstract function is not implemented";
    }

    // ---------------------------------- legend ------------------------------------
    getCurrentMax() {
        throw "Abstract function is not implemented";
    }
    
    getLegendSize() {
        return {
            barheight: 200,
            barwidth: 20,
            barX: 0,
            barY: 50 }
    }

    createLegend() {
        const {
            barheight,
            barwidth,
            barX,
            barY } = this.getLegendSize();

        this.currentMax = this.getCurrentMax();
        // Linear scale for y-axis
        this.yColourScale = d3
            .scaleLinear()
            .domain([0, this.currentMax])
            .range([barheight, 0]);

        //call this when changing the category (and changing the yColourScale.domain)
        this.yColourAxis = d3.axisRight(this.yColourScale);

        const colourAxisTicks = this.yColourScale.ticks(4);
        colourAxisTicks.push(this.currentMax);
        this.yColourAxis.tickValues(colourAxisTicks);

        this.colorScale = d3
            .scaleSequential(interpolateBluesMod)
            .domain([0, this.currentMax])

        //ticks needed to create the colour gradient (these are not for the axis)
        const colourticks = this.colorScale.ticks().concat(this.colorScale.domain()[1]);

        this.createColorScaleLegend(this.mapSvg, barX, barY, barwidth, barheight, colourticks);
        this.mapSvg.append("text")
            .attr("y", barY - 20)
            .attr("x", barX)
            .text(`Legende: ${this.text}`)
            .attr("font-weight", 500)
            .attr("class", "legend")
            .style("font-size", "80%");
    }

    createColorScaleLegend(root, x, y, width, height, ticks) {
        root.append("g")
            .attr("class", "colourAxis")
            .attr("transform", `translate(${x + width},${y})`)
            .call(this.yColourAxis)
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
            .data(ticks.map((t, i, n) => ({offset: `${100 * i / n.length}%`, color: this.colorScale(t)})))
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

    updateLegendAxis(currentMax) {
        this.yColourScale.domain([0, currentMax]);

        const colourAxisTicks = this.yColourScale.ticks(4);
        if ((currentMax - colourAxisTicks[colourAxisTicks.length - 1]) / (colourAxisTicks[colourAxisTicks.length - 1] - colourAxisTicks[colourAxisTicks.length - 2]) < 0.24) {
            colourAxisTicks.pop();
        }
        colourAxisTicks.push(currentMax);
        this.yColourAxis.tickValues(colourAxisTicks);

        this.mapSvg.select('.colourAxis')
            .transition()
            .call(this.yColourAxis);
    }
}

export class D3ToggleMap extends D3Map{
    constructor(id, toggleId, allFeatures, quarterGeometrySmall, isToggled, quarterGeometryData, totalPerQuarter, textOn, textOff) {
        super(id, allFeatures, quarterGeometrySmall, quarterGeometryData, totalPerQuarter, textOff);
        this.id = id;
        this.allFeatures = allFeatures;
        this.quarterGeometrySmall = quarterGeometrySmall;
        this.isToggled = isToggled;
        this.quarterGeometryData = quarterGeometryData;
        this.totalPerQuarter = totalPerQuarter;
        this.textOff = textOff;
        this.textOn = textOn;
        this.addToggleListener(toggleId);
    }
    getWidthAndHeight() {
        const WIDTH = window.innerWidth / 4;
        const HEIGHT = window.innerHeight / 2;
        return { WIDTH, HEIGHT };
    }

    // -------------------------- effect handlers for the map -----------------
    mouseOutHandler(event, data) {
        const [count, max] = this.getInfoForColouringMap(data, this.isToggled);
        const selectedColor = linearScaleColour(count, max);
        d3.select(event.target).attr("fill", selectedColor);

        this.tooltip.style("opacity", 0);
    }

    // ---------------------------------- legend ------------------------------------
    getLegendSize() {
        return {
            barheight: 100,
            barwidth: 15,
            barX: 10,
            barY: 50 }
    }

    addToggleListener(id) {
        d3.select(id).on("change", (_) => {
            this.isToggled = d3.select(id).property("checked");
            this.updateAndCalcLegendAxis(this.isToggled);

            this.map.data(this.dataInMapFormat)
                .attr("fill", (d, _) => {
                    const [count, max] = this.getInfoForColouringMap(d, this.isToggled);
                    return linearScaleColour(count, max);
                });
            const legendText = this.isToggled ? `Legende: ${this.textOn}` : `Legende: ${this.textOff}`
            this.mapSvg.select(".legend")
                .text(legendText)
        });
    }
}
