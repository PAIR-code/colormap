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


window.initLine = function(space, type, sel){
  var typeI = space.key.indexOf(type)

  sel = sel.append('div')
    .st({marginLeft: 10, display: 'inline-block', textAlign: 'center'})

  var type2str = {l: 'Lightness', s: 'Saturation', h: 'Hue', c: 'Chroma', r: 'Red', g: 'Green', b: 'Blue'}
  sel.append('div')
    .html(space.ppKeys ? space.ppKeys[typeI] : type2str[type] || type)
    .st({fontSize: 12, color: '#333'})
  if (type == 'l') sel.lower()

  var c = d3.conventions({
    sel,
    width: 290,
    height: 120,
    margin: {top: 0, bottom: 28, left: 25}
  })
  c.svg.append('rect').at({width: c.width, height: c.height, fill: '#eee'})

  c.x.interpolate(d3.interpolateRound)

  c.y.domain([space.min ? space.min[typeI] : 0, space.max[typeI]])
    .clamp(1)
    .interpolate(d3.interpolateRound)

  c.yAxis.ticks(5)
  c.xAxis.ticks(5).tickValues([0, .25, .5, .75, 1])
  d3.drawAxis(c)

  c.svg.selectAll('.y .tick')
    .append('path').at({d: 'M 0 0 H ' + c.width, stroke: '#fff', strokeWidth: 1})
  c.svg.selectAll('.y text').at({x: -3})
  c.svg.selectAll('.x .tick')
    .append('path').at({d: 'M 0 0 V -' + c.height, stroke: '#fff', strokeWidth: 1})
  c.svg.selectAll('.x text').at({y: 2})

  var pathSel = c.svg.append('path')
    .at({stroke: '#000', fill: 'none'})

  var line = d3.line()
    .curve(d3.curveStep)
    .x((d, i) => c.x(i/(state.numTicks - 1)))
    .y(d => c.y(d[type]) || 0)
    .defined(d => isFinite(c.y(d[type])))

  var cy = i => c.y(space.colors[i][type]) || 0

  var drag = d3.drag()
    .on('drag', function(i){
      var [mx, my] = d3.mouse(c.svg.node())

      var tmp = space.colors[i]
      tmp[type] = c.y.invert(my)
      state.colors[i] = tmp

      window.render()
    })
    // .subject(i => ({y: cy(i)}))

  var circleSel = c.svg.appendMany('circle', d3.range(state.colors.length))
    .at({
      r: 7,
      cx: i => i/(state.colors.length - 1)*c.width,
      fill: 'rgba(0,0,0,0)',
      stroke: '#000',
    })
    .st({cursor: 'pointer',})
    .call(drag)

  function render(){
    pathSel.at({d: line(space.tickColors)})
    circleSel.at({cy})
  }

  return {render}
}
