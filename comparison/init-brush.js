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


window.initBrush = function(){
  var rv = {domain: [0, 1]}

  var brushHeight = 256
  var brushWidth = 200
  var y = d3.scaleLinear().domain([0, brushHeight]).range([0, 1])

  var startExtent = [brushWidth, 400]

  var svg = d3.select('#histogram').html('').append('svg.left-brush')
    .st({marginLeft: 0})
    .at({width: brushWidth, height: brushHeight})

  // histogram
  var histogramSel = svg.append('g')

  // brush
  var brush = d3.brushY()
    .extent([[0, 0], [brushWidth, brushHeight]])
    .on('brush', brushed)

  var brushSel = svg.append('g')
    .call(brush)
    .call(brush.move, [0, brushHeight])
    .st({opacity: .8})

  svg.select('.selection').st({fill: '#f0f'})
  svg.selectAll('.handle').st({fill: '#f0f'})

  function brushed(){
    rv.domain = d3.event.selection.map(y)
    if (window.scales) window.scales.update()
  }

  rv.setDomain = (array) => {
    rv.domain = array
    brushSel.call(brush.move, array.map(y.invert))
  }

  rv.updateHistogram = () => {
    var histData = d3.nestBy(transform.data.filter(isFinite), d => Math.round(d*brushHeight))
    var maxLength = d3.max(histData, d => d.length)

    histogramSel.selectAll('path').remove() // TODO only update position
    histogramSel.appendMany('path', histData)
      .at({
        d: d => ['M', 0, +d.key + .5, 'H', d.length/maxLength*brushWidth].join(' '),
        stroke: '#fff',
        pointerEvents: 'none',
      })

    if (window.scales) window.scales.update()
  }
  rv.updateHistogram()


  return rv
}


if (window.init) init()
