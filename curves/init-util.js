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


window.initUtil = function(){
  var params = (function(){
    var url = new URL(window.location)
    var searchParams = new URLSearchParams(url.search) 

    var rv = {}

    var get = key => {
      return searchParams.get(key)
    }

    var set = (key, value) => {
      searchParams.set(key, value)

      url.search = searchParams.toString()
      history.replaceState(null, '', url)
    }

    var setAll = _.debounce(() => {
      set('colors', state.colors.map(formatHex).join('-').replaceAll('#', ''))
      set('numTicks', state.numTicks)
      set('space', state.space)
      set('type', state.type)
    }, 200)

    var getAll = () => {
      var colors = get('colors') ? 
        get('colors').split('-').map(d => d3.color('#' + d)) : 
        ['#00429d', '#96ffea', '#cccccc', '#ff005e', '#93003a'].map(d => d3.color(d))

      var numTicks = +get('numTicks') || 255
      var space = get('space') || 'lab'
      var type = get('type') || 'basis'

      return {colors, numTicks, space, type}
    }

    return {get, set, setAll, getAll}
  })()

  // https://github.com/d3/d3-color
  function formatHex(d){
    d = d3.color(d)
    return "#" + hex(d.r) + hex(d.g) + hex(d.b)

    function hex(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0))
      return (value < 16 ? '0' : '') + value.toString(16)
    }
  }

  var bc = new BroadcastChannel('CustomGray')
  function broadcastScale(scale){
    var n = 1024
    var samples = d3.range(n).map(i => {
      var c = d3.color(scale(i/n))
      return [c.r, c.g, c.b]
    })
    bc.postMessage(samples)
  }

  return {params, formatHex, broadcastScale}
}
