import {IMAGE, X, Y} from './image'

const layers = (image: string, length: number) => {
  let i = 0

  const layers: string[] = []

  while(i * length < image.length){
    layers.push(image.substr(i * length, length))
    i++
  }

  return layers
}

const LAYERS = layers(IMAGE, X * Y)

const image = LAYERS.reduce((image, layer) => {
  layer.split('').forEach((pixel, i) => {
    if(image[i] === '2'){
      image[i] = pixel
    }
  })

  return image
}, LAYERS[0].split(''))

const rows = layers(image.join(''), X)

rows.forEach((row) => {
  console.log(row.split('').map((c) => {
    if(c === '1'){
      return '█'
    }

    return ' '
  }).join(''))
})
