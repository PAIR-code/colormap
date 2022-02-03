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


window.initColorInput = function(){
  var sel = d3.select('.color-input').html('')

  var padding = 10
  var wordSpacing = 30
  var fontSize = 14
  var charWidth = calcCharWidth()

  var inputSel = sel.append('input')
    .st({padding, 'word-spacing': wordSpacing + 'px', fontSize, width: 1012})
    .at({spellcheck: 'false'})
    .on('change', onTextChange)
    .on('keyup', () => {
      if (d3.event.key == 'Enter') onTextChange()
    })

  var inputNode = inputSel.node()

  function onTextChange(){
    state.colors = inputNode.value.trim().split(' ').filter(d => d).map(d3.color)
    window.render()
  }

  var colorSel = sel.append('div')
    .st({marginLeft: 10, marginTop: 5})

  function render(){
    inputNode.value = state.colors.map(util.formatHex).join(' ')

    var colorsSel = colorSel.selectAll('input')
      .data(state.colors)
    colorsSel.exit().remove()

    colorsSel = colorsSel.enter().append('input')
      .at({type: 'color'})
      .st({width: charWidth*8.4, marginRight: wordSpacing, padding: 0})
      .on('input', function(d, i){
        state.colors[i] = d3.color(this.value)
        window.render()
      })
      .merge(colorsSel)
      .at({value: util.formatHex})
  }

  return {render}

  function calcCharWidth(){
    var spanSel = d3.select('body').selectAppend('span').text('x')
      .st({fontFamily: 'monospace', fontSize, position: 'absolute', top: -100})

    return spanSel.node().offsetWidth
  }
}
