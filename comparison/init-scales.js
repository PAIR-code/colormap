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


window.initScales = function(){
  var sel = d3.select('#image-container').html('')

  var diverging = 'BrBG PRGn PiYG PuOr RdBu RdGy RdYlBu RdYlGn Spectral'.split(' ')
  var sequential = 'Turbo Viridis Custom Inferno Magma Plasma Cividis Warm Cool CubehelixDefault Rainbow Sinebow'.split(' ')
  var boring = 'Blues Greens Greys Oranges Purples'.split(' ')

  var allScales = sequential.concat(diverging).concat(boring)

  var scales = window.scales || allScales//.slice(0, 4)
    .map((d, i) => ({interpolate: d3['interpolate' + d], name: d, i}))

  // var scales = 'Turbo'.split(' ')
  //   .map(d => ({interpolate: d3['interpolate' + d], name: d}))

  var {width, height} = image
  var {nSamples} = config

  var scaleSel = sel
    .append('div').st({width: width*2 + 50})
    .appendMany('div', scales).each(drawScale).st({display: 'inline-block'})

  function drawScale(scale){

    scale.offScreen = false
    scale.dirty = false

    var observer = new IntersectionObserver((entries, observer) => {
      var prevOffScreen = scale.offScreen 
      scale.offScreen = !entries[0].isIntersecting

      if (prevOffScreen && !scale.offScreen) scale.update()
    })
    observer.observe(this)

    var sel = d3.select(this).html('')
      .st({position: 'relative'})
      .on('click', function(){
        scale.setAsActive()
      })

    scale.setAsActive = () => {
      scales.active = scale
      exportCode.update(scale)
      scaleSel.selectAll('.code-button').classed('active', d => d == scale)
    }

    var selectSel = sel.append('select')
      .st({position: 'absolute', top: 3, left: 4, zIndex: 100, fontSize: 14})
      .on('change', () => {
        var name = selectSel.parent().node().value
        var {i, invert} = scale
        var newScale = {interpolate: d3['interpolate' + name], name, i, invert}
        scales[scale.i] = newScale

        drawScale.call(this, newScale)
        newScale.update()
      })
      .appendMany('option', allScales)
      .text(d => d)
      .at({value: d => d})
      .property('selected', d => d == scale.name)

    var invertSel = sel.append('div.button.invert')
      .st({position: 'absolute', top: 0, left: 140, zIndex: 100})
      .text('invert')
      .classed('inverted', scale.invert)
      .on('click', () => {
        scale.invert = !scale.invert
        drawScale.call(this, scale)
        scale.update()
      })

    var ctx = sel.append('canvas')
      .at({width: width, height: height})
      .st({width, height, marginRight: 5, position: 'relative', paddingTop: 22*0, paddingBottom: 5*0})
      .node().getContext('2d')

    ctx.fillRect(0, 0, width, height)
    var imageDataRaw = ctx.getImageData(0, 0, width, height)

    if (!scale.interpolate){
      scale.samples = custom.samples.slice()
    } else {
      scale.samples = d3.range(nSamples)
        .map(d => scale.interpolate(d/(nSamples - 1)))
        .map(d3.color)
        .map(d => [d.r, d.g, d.b])
    }

    if (scale.invert) scale.samples.reverse()

    scale.samples[nSamples] = [255, 255, 255]
    scale.samples[nSamples + 1] = [255, 255, 255]

    scale.update = () => {
      if (scale.offScreen) return scale.dirty = true

      var [e0, e1] = brush.domain
      imageData = imageDataRaw.data

      var samples = scale.samples

      for (var i = 0; i < imageData.length/4 && i < transform.data.length; i++){
        var colorIndex = Math.round((transform.data[i] - e0)/(e1 - e0)*nSamples)

        if (colorIndex == Infinity){ 
          colorIndex = nSamples 
        } else if (colorIndex == -Infinity) {
          colorIndex = nSamples + 1
        } else if (colorIndex < 0){
          colorIndex = 0
        } else if (colorIndex >= nSamples){
          colorIndex = nSamples - 1
        }

        imageData[i*4 + 0] = samples[colorIndex][0]
        imageData[i*4 + 1] = samples[colorIndex][1]
        imageData[i*4 + 2] = samples[colorIndex][2]
      }

      ctx.putImageData(imageDataRaw, 0, 0)
    }

    var svg = sel.append('svg')
      .at({width, height})
      .st({position: 'absolute', top: 0, left: 0})

    svg.append('rect').at({width, height, opacity: 0})

    var rectSel = svg.append('rect')
      .at({stroke: '#f0f', fill: 'none'})

    var start = {}
    var drag = d3.drag()
      .filter(() => d3.event.shiftKey) // only shift
      .on('start', () => {
        start = d3.event; rectSel.at({opacity: 1, width: 0, height: 0})
      })
      .on('drag', () => {
        var x = Math.min(d3.event.x, start.x)
        var y = Math.min(d3.event.y, start.y)
        var width = Math.abs(d3.event.x - start.x) + 1
        var height = Math.abs(d3.event.y - start.y) + 1
        rectSel.at({x, y, width, height})

        var extent = d3.extent(transform.data.filter((d, i) => {
          var px = i % image.width
          var py = Math.floor(i / image.width)

          return x <= px && px <= (width + x )&& y <= py && py <= (height + y)
        }))

        brush.setDomain(extent)

      })
      .on('end', () => rectSel.at({opacity: 0}))

    svg.call(drag)
  }

  window.scales = scales
  scales[0].setAsActive()

  scales.update = _.throttle(() => scales.forEach(d => d.update()), 0)
  scales.update = () => {
    scales.forEach(d => d.update())

    exportCode.update() 
  }
  return scales
}


if (window.init) init()
