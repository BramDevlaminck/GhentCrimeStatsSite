<script>

import * as vl from "vega-lite-api"
import embed from "vega-embed"

const brush = vl.selectInterval()
    .resolve('global'); // resolve all selections to a single global instance

const legend = vl.selectPoint()
    .fields('year')
    .bind('legend'); // bind to interactions with the color legend

const brushAndLegend = vl.and(brush, legend);

const hover = vl.selectPoint('hover')
    .encodings('x')
    .on('mouseover')
    .toggle(false)
    .nearest(true);

const isHovered = hover.empty(false);

// Line chart
const line = vl.markLine({point: true, interpolate: 'monotone'}).encode(
    vl.x().month('formatted_date').title("Month"),
    vl.y().fieldQ('TotalNumberIncidents').title("Number Of Incidents"),
    // vl.tooltip([{field:'year', title:'Year'}, {field:'month', title:'Month'}, {field:'TotalNumberIncidents', title:'Number of incidents'}]),
    vl.color().if(brushAndLegend, vl.color().scale({scheme: 'viridis'}).fieldO('year')).value('grey'),
    vl.opacity().if(brushAndLegend, vl.value(0.8)).value(0.1)
);

// shared base for new layers, filtered to hover selection
const base = line.transform(vl.filter(isHovered));

// mark properties for text label layers
const label = {align: 'left', dx: 5, dy: -5};
const white = {stroke: 'white', strokeWidth: 2};


export default {
  props: { // get the data
    combinedData: Array
  },
  created() { // draw the graph using the data from the prop
    const graph = vl.data(this.combinedData)
        .layer(line.params(brush, legend),
            // add a rule mark to serve as a guideline
            vl.markRule({color: '#aaa'})
                .transform(vl.filter(isHovered))
                .encode(vl.x().month('formatted_data')),
            line.markCircle().params(hover)
                .encode(vl.opacity().if(isHovered, vl.value(1)).value(0)),
            // add white stroked text to provide a legible background for labels
            base.markText(label, white).encode(vl.text().fieldQ('TotalNumberIncidents')),
            // add text labels for TotalNumberIncidents
            base.markText(label).encode(vl.text().fieldQ('TotalNumberIncidents'))
        )
        .title("Total Number of Incidents Per Month Per Year")
        .width(800)
        .transform(
            vl.groupby(['year', 'month', 'formatted_date']).aggregate(vl.sum('total').as("TotalNumberIncidents"))
        );
    // bind the graph to the div with id graph
    embed('#graph', graph.toSpec())
  }
}
</script>


<template>
  <div id="graph"></div>
</template>