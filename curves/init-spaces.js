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


window.initSpaces = function(){

  // https://observablehq.com/@fil/oklab-color-space
  const gamma = x => (x >= 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x)
  d3.oklab = (L, a, b) => {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    return d3.rgb(
      255 * gamma(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      255 * gamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      255 * gamma(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)
    );
  }

  var spaces = {
    lab: {
      max: [100, 160, 160],
      min: [0, -160, -160],
      link: 'https://en.wikipedia.org/wiki/CIELAB_color_space#Cylindrical_representation:_CIELCh_or_CIEHLC',
      ppKey: 'L*a*b*',
      ppKeys: ['Lightness', 'Red/Green', 'Blue/Yellow']
    },
    // oklab: {
    //   max: [100, 160, 160],
    //   min: [0, -160, -160],
    //   link: 'https://bottosson.github.io/posts/oklab/',
    //   ppKey: 'Oklab',
    //   ppKeys: ['Lightness', 'Red/Green', 'Blue/Yellow']
    // },
    hcl: {
      max: [360, 230, 100],
      link: 'https://en.wikipedia.org/wiki/HCL_color_space',
    },
    cubehelix: {
      max: [360, 2, 1],
      link: 'http://www.mrao.cam.ac.uk/~dag/CUBEHELIX/',
      ppKey: 'Cubehelix',
      key: 'hsl'
    },
    hsl: {
      max: [360, 1, 1],
      link: 'https://en.wikipedia.org/wiki/HSL_and_HSV',
    },
    rgb: {
      max: [255, 255, 255],
      link: 'https://en.wikipedia.org/wiki/Color_space',
    },
  }

  var spacesSel = d3.select('.spaces').html('')
  var bandsSel = d3.select('.bands').html('')

  d3.entries(spaces).forEach(({key, value}) => {
    var space = value
    space.fn = d3[key]
    space.key = space.key || key
    space.keyOrig = key
    space.ppKey = space.ppKey || key.toUpperCase()

    space.interpolate = d3['interpolate' + key[0].toUpperCase() + key.slice(1)]

    space.sel = spacesSel.append('div.space')
    space.sel.append('div.space-label')
      .append('a').text(space.ppKey).at({href: space.link})
    var lineSel = space.sel.append('div.lines')

    space.lines = space.key.split('').map(type => initLine(space, type, lineSel))

    space.basisInterpolate = createBasisInterpolate(space)
    space.linearInterpolate = (colors) => d3.scaleLinear()
      .domain(colors.map((d, i) => i/(colors.length - 1)))
      .range(colors)
      .interpolate(space.interpolate)

    var bandSel = bandsSel.append('div')
    space.initBands = () => {
      bandSel.html('')
      space.basisBand = initSpaceBand(space, 'basis', bandSel.append('div'))
      space.linearBand  = initSpaceBand(space, 'linear', bandSel.append('div'))
    }
    space.initBands()
  })

  // https://github.com/d3/d3-interpolate/blob/main/src/rgb.js#L54
  function createBasisInterpolate(space){
    var [aKey, bKey, cKey] = space.key.split('')

    return function(colors) {
      var n = colors.length,
          a = new Array(n),
          b = new Array(n),
          c = new Array(n),
          i, color;
      for (i = 0; i < n; ++i) {
        color = space.fn(colors[i])
        a[i] = color[aKey] || 0
        b[i] = color[bKey] || 0
        c[i] = color[cKey] || 0
      }
      a = d3.interpolateBasis(a)
      b = d3.interpolateBasis(b)
      c = d3.interpolateBasis(c)
      color.opacity = 1
      return function(t) {
        color[aKey] = a(t)
        color[bKey] = b(t)
        color[cKey] = c(t)
        return color + ''
      }
    }
  }

  return spaces
}

