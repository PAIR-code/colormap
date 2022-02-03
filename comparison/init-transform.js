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


window.initTransform = function(){
  var rv = {data: image.data}

  // var sortedData = _.sortBy(data)
  var quantile = d3.scaleQuantile()
    .domain(image.data)
    .range(d3.range(0, 1, 1/config.nSamples))

  var transforms = [
    {
      name: 'Linear', 
      fn: d => d,
    },
    {
      name: 'Sqrt', 
      fn: Math.sqrt
    },
    {
      name: 'Quad', 
      fn: d => d*d
    },
    {
      name: 'Quantile', 
      // fn: (d, i) => i/data.length,
      fn: quantile,
    },
    // {
    //   name: 'Custom',
    //   fn: d => d // add text box for code
    // }
  ]

  var sel = d3.select('#transform').html('')

  var buttonSel = sel.appendMany('div.button', transforms)
    .text(d => d.name)
    .on('click', updateActive)

  function updateActive(d){
    rv.active = d
    buttonSel.classed('active', e => e == d)
    rv.data = image.data.map(d.fn)

    if (window.brush) brush.updateHistogram()
  }
  updateActive(transforms[0])


  // Called when image data updates
  rv.updateData = () => {
    quantile.domain(image.data)
    rv.data = image.data.map(rv.active.fn)

    brush.updateHistogram()
  }

  return rv
}