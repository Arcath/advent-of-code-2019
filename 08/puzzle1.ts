import {IMAGE, X, Y} from './image'

const layers = () => {
  const length = X * Y

  let i = 0

  const layers = []

  while(i * length < IMAGE.length){
    layers.push(IMAGE.substr(i * length, length))
    i++
  }

  return layers
}

const count = (char: string, str: string) => {
  let count = 0
  
  str.split('').forEach((c) => {
    if(c === char){
      count++
    }
  })

  return count
}

const minLayer = layers().reduce((c, layer) => {
  if(count('0', layer) < count('0', c)){
    return layer
  }

  return c
})

console.log(count('1', minLayer) * count('2', minLayer))