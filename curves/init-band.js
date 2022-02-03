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


window.initBand = function(){
  var sel = d3.select('.band').html('')

  var c = d3.conventions({
    sel,
    height: 100,
    margin: {left: 0, right: 0}
  })

  var s = Math.floor(c.width/state.numTicks)
  var rectSel = c.svg.appendMany('rect', d3.range(state.numTicks))
    .at({
      height: c.height, 
      width: s,
      x: i => s*i
    })

  function render(tickColors){
    rectSel.st({fill: (d, i) => tickColors[i]})
  }

  return {render}
}
