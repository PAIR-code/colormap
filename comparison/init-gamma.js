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


window.initGamma = function(){
  var sel = d3.select('#gamma')

  // TODO reset button

  var width = 130
  var height = 10

  var sliders = [
    {
      text: 'Brightness',
      r: [1/1.25, 1.25],
      v: 1
    },
    {
      text: 'Contrast',
      r: [1/1.25, 1.25],
      v: 1
    },
  ]
  var sliderVals = {}

  sliders.forEach(d => {
    d.s = d3.scaleLog().domain(d.r).range([0, width])
    d.key = d.text.toLowerCase()
    sliderVals[d.key] = d
  })

  var sliderSel = d3.select('#gamma').html('')
    .appendMany('div', sliders)
    .at({class: d => d.key})
    .st({
      display: 'inline-block',
      width: width,
      paddingRight: 20,
      marginTop: 5,
      color: '#000'
    })

  sliderSel.append('div')
    .text(d => d.text)
    .st({color: '#fff'})
    .st({marginBottom: height/2})

  var svgSel = sliderSel.append('svg').at({width, height})
    .on('click', function(d){
      d.v = d.s.invert(d3.mouse(this)[0])
      updatePos()
    })
    .st({
      cursor: 'pointer'
    })
    .append('g').translate(height/2, 1)

  svgSel.append('rect').at({width, height, y: -height/2, fillOpacity: 0})

  svgSel.append('path').at({
    d: `M 0 .5 H ${width}`, 
    stroke: '#fff',
    strokeWidth: 1
  })

  var drag = d3.drag()
    .on('drag', function(d){
      var x = d3.mouse(this)[0]
      d.v = d3.clamp(d3.min(d.r), d.s.invert(x), d3.max(d.r))

      updatePos()
    })

  var circleSel = svgSel.append('circle')
    .at({
      r: height/2,
      stroke: '#fff', 
      strokeWidth: 0,
      fill: '#f0f',
    })
    .call(drag)


  function updatePos(){
    circleSel.at({cx: d => d.s(d.v)})


    var b = d3.format('%')(sliderVals.brightness.v)
    var c = d3.format('%')(sliderVals.contrast.v)

    // TODO modify color ramp directly
    d3.selectAll('canvas')
      .st({filter: `brightness(${b}) contrast(${c})`})
  }

  updatePos()
  sliderVals.updatePos = updatePos
  return sliderVals
}

if (window.init) init()


