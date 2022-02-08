/* Copyright 2022 Google LLC. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/


console.clear()

window.config = {
  nSamples: 1024, // number of colors in each map
}
var bc = new BroadcastChannel('custom-colormap')


var colors = ['R', 'G', 'B'].map(d => {
  var scale = d3.scaleLinear()
  return {name: d, scale, points: [[0, 0], [.5, .5], [1, 1]]}
})




var sel = d3.select('#graph').html('')


sel.appendMany('div', colors)
  .each(drawColor)
  .st({display: 'inline-block', width: '32%'})


function drawColor(color){
  var sel = d3.select(this)

  sel.append('h3').text(color.name)
    .st({textAlign: 'center'})

  var c = color.c = d3.conventions({
    sel: sel.append('div'),
    width: 220,
    height: 220,
    margin: {top: 0}
  })

  c.x.clamp(1)
  c.y.clamp(1)

  c.xAxis.ticks(5).tickSize(c.width)
  c.yAxis.ticks(5).tickSize(c.height)
  d3.drawAxis(c)

  c.svg.select('.x')
    .translate(0, 0)
    .selectAll('text').at({dy: 10})
  c.svg.select('.y')
    .translate(c.width, 0)
    .selectAll('text').at({dx: -3})

  var line = d3.line()
    .x(d => c.x(d[0]))
    .y(d => c.y(d[1]))

  var lineSel = c.svg.append('path').at({stroke: '#f0f', fill: 'none'})

  var drag = d3.drag()
    .subject(d => ({x: c.x(d[0]), y: c.y(d[1])}))
    .on('drag', d => {
      d[0] = c.x.invert(d3.event.x)
      d[1] = c.y.invert(d3.event.y)

      render()
    })

  var pointSel = c.svg.appendMany('circle', color.points)
    .at({
      r: 5,
      fill: '#a0a',
      // fillOpacity: .5,
      stroke: '#f0f',
      cursor: 'pointer',
    })
    .call(drag)

  function render(){
    color.points = _.sortBy(color.points, d => d[0])

    // update dom
    pointSel.translate(d => [c.x(d[0]), c.y(d[1])])
    lineSel.at({d: line(color.points)})

    color.scale
      .domain(color.points.map(d => d[0]))
      .range(color.points.map(d => d[1]))

    var samples = d3.range(config.nSamples).map(d => {
      var v = d/config.nSamples
      return colors.map(c => c.scale(v)*256).map(Math.round)
    })

    console.log(samples)

    bc.postMessage(samples)
  }
  render()

  bc.onmessage = function({data}){
    if (data == 'force-render') window.render()
  }
}








