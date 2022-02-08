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


window.initCustom = function(){
  var rv = {}

  rv.samples = d3.range(config.nSamples).map(d => {
    var v = Math.round(d/config.nSamples*256)
    return [v, v, v]
  })

  var bc = new BroadcastChannel('custom-colormap')
  bc.onmessage = function(bcSamples){
    if (bcSamples.data == 'force-render') return

    rv.samples = bcSamples.data
    rv.samples[config.nSamples - 1] = [255, 255, 255]
    rv.samples[config.nSamples + 0] = [255, 255, 255]
    rv.samples[config.nSamples + 1] = [255, 255, 255]
    rv.samples[config.nSamples + 2] = [255, 255, 255]
    rv.samples[config.nSamples + 3] = [255, 255, 255]
    rv.samples[config.nSamples + 4] = [255, 255, 255]

    scales
      .filter(d => d.name == 'Custom')
      .forEach(d => {
        d.samples = rv.samples
        d.update()
      })
  }

  bc.postMessage('force-render')

  return rv
}

if (window.init) init()