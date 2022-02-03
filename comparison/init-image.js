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


window.initImage = async function(){
  d3.select('#import').node().value = params.get('img') || 'data/0.png'
  d3.select('#import').on('change', update)

  function dropHandler(ev) {
    console.log('file dropped')
    ev.preventDefault()

    var file = ev.dataTransfer.items[0].getAsFile()

    var reader = new FileReader()

    if (file.name.includes('.png')){
      reader.readAsDataURL(file)
      reader.onloadend = async () => {
        var data = await png2data(reader.result)
        update(data)
      }
    } else if (file.name.includes('.json')){
      reader.readAsText(file)
      reader.onload = async => {
        var data = json2data(JSON.parse(reader.result))
        update(data)
      }
    }
  }
  d3.select('body').node().ondrop = dropHandler
  d3.select('body').node().ondragover = ev => ev.preventDefault()

  async function png2data(path){
    var img = await IJS.Image.load(path)
    var {height, width} = img

    var max = img.bitDepth == 8 ? 256 : 65536
    var data = new Float32Array(img.grey().data)
      .map(d => d == 255 ? 257 : d)
      .map(d => d/max)
      .map(d => isNaN(d) ? Infinity : d)

    data.width = width
    data.height = height

    return data
  }

  function json2data(squareData){
    var width = squareData.length
    var height = squareData[0].length
    
    var data = []
    for (var j = 0; j < height; j++){
      for (var i = 0; i < width; i++){
        data.push(squareData[i][j])
      }
    }

    var max = d3.max(data)
    data = data
      .map(d => d/max)
      .map(d => isNaN(d) ? Infinity : d)

    data.width = width
    data.height = height

    return data
  }

  async function loadNewImage(data){
    var url = d3.select('#import').node().value

    if (data){
      // skip, data already processed from file
      url = ''
    } else if (url.includes('.png')){
      data = await png2data(url)
    } else if (url.includes('.json')){
      var squareData = await (await fetch(url)).json()
      data = json2data(squareData)
    } else {
      throw 'missing filetype'
    }

    params.set('img', url)

    return {data, width: data.width, height: data.height}
  }


  async function update(data){
    window.image = await loadNewImage(data)

    if (window.transform) transform.updateData()

    window.scales = makeScales()
    scales.update()
  }

  // Cache for hot reloading
  if (!window.image){
    return await loadNewImage()
  } else {
    return window.image
  }
}







// // array buffer loader
// window.makeImage = async function(){

//   // TODO run again when url changes

//   // TODO import json grid
//   // TODO import 16bit png
//   // TODO import rgb png

//   var height = 462
//   var width = 681
//   var bufPath = '../../raw/sample-2.buf'

//   // Cache for hot reloading
//   if (!window.image){
//     var res = await fetch(bufPath)
//     var buf = await res.arrayBuffer()
//     var data = new Float32Array(buf)
//   } else {
//     var data = image.data
//   }

//   return {width, height, data}
// }



// var bodySel = d3.select('body')
//   .on('drop', async function(){
//     console.log('file dropped')
//     d3.event.preventDefault()

//     var file = d3.event.dataTransfer.items[0].getAsFile()
//     var reader = new FileReader()
//     reader.readAsDataURL(file)
//     reader.onloadend = async () => {
//       var img = await IJS.Image.load(reader.result)
//       console.log(img)
//     }

//   })
//   .on('dragover', () => {
//     d3.event.preventDefault()
//     bodySel.st({opacity: .7})
//   })
//   .on('dragend', () => {
//     bodySel.st({opacity: 1})
//   })




if (window.init) init()
