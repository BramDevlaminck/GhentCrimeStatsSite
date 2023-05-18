import * as d3 from "d3";

export default function createDropdown(id, data, callback) {
    // add the options to the button
    d3.select(id)
        .selectAll('myOptions')
        .data(data)
        .enter()
        .append('option')
        .text(d => d) // text showed in the menu
        .attr("value", d => d); // corresponding value returned by the button

    // Listen to dropdown
    d3.select(id).on("change", function (_) {
        callback(this.value);
    });
}

export function createBarChartSvg(id, width, height, margin) {
    return d3.select(id)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.right})`)
}

export function configureBarChartAxis(svg, width, height, xDomain, yDomain) {
    // Add X axis
    const x = d3.scaleLinear()
        .domain(xDomain)
        .range([0, width])
        .nice();

    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Y axis
    const y = d3.scaleBand()
        .range([0, height])
        .domain(yDomain)
        .padding(.1);

    const yAxis = svg.append("g")
        .call(d3.axisLeft(y));
    return { x, xAxis, y, yAxis }
}

export function createText(svg, y, x, text) {
    return svg.append("text")
        .attr("text-anchor", "end")
        .attr("y", y)
        .attr("x", x)
        .text(text)
        .style("font-size", "80%");
}

export function createTooltip(id) {
    return d3.select(id)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("position", "absolute");
}