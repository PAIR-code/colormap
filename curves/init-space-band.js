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


window.initSpaceBand = function(space, type, sel){
  sel
    .classed('space-band', 1)
    .datum({space, type})
    .on('click', d => {
      state.type = type
      state.space = space.keyOrig
      console.log(state)
      window.render()
    })

  var c = d3.conventions({
    sel,
    width: 255*2,
    height: 30,
    margin: {bottom: 0, top: 10, left: 0, right: 5}
  })

  c.svg.append('rect.bg-rect')
    .at({width: c.width/3, height: 30, y: -15})

  c.svg.append('text')
    .text(space.ppKey + ' ' + type)
    .at({fontSize: 12, y: -2})

  var s = Math.floor(c.width/state.numTicks)
  var rectSel = c.svg.appendMany('rect', d3.range(state.numTicks))
    .at({
      height: c.height, 
      width: s,
      x: i => s*i
    })

  function render(){
    var scale = type == 'basis' ? 
      space.basisInterpolate(state.colors) : 
      space.linearInterpolate(state.colors)

    var tickColors = d3.range(state.numTicks).map(i => scale(i/state.numTicks))
    rectSel.st({fill: (d, i) => tickColors[i]})
  }

  return {render}
}
