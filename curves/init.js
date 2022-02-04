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



window.init = function(){
  window.util = initUtil()
  
  window.state = window.state || util.params.getAll()
  window.prevState = window.state

  initNumColors()
  window.colorInput = initColorInput() 
  window.outputColors = initOutputColors()
  window.spaces = initSpaces()
  window.band = initBand()

  window.render()
}

window.render = function(){
  if (prevState.colors.length != state.colors.length){
    window.spaces = initSpaces()
    window.band = initBand()
  }

  var scale = spaces[state.space][state.type + 'Interpolate'](state.colors)
  util.broadcastScale(scale)
  
  var tickColors = d3.range(state.numTicks).map(i => scale(i/state.numTicks))
  band.render(tickColors)
  outputColors.render(tickColors)

  d3.values(spaces).forEach(space => {
    space.colors = state.colors.map(d => space.fn(d))
    space.tickColors = tickColors.map(d => space.fn(d))

    space.lines.forEach(d => d.render())
    space.basisBand.render()
    space.linearBand.render()
  })

  d3.selectAll('.space-band')
    .classed('active', d => d.space.keyOrig == state.space && d.type == state.type)

  colorInput.render()
  util.params.setAll()

  window.prevState = JSON.parse(JSON.stringify(window.state))
}

init()
window.__onHotServer = () => {
  console.clear()
  init()
}