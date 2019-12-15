export class Moon{
  constructor(public x: number, public y: number, public z: number){}

  equal(to: Moon | Velocity){
    return (this.x === to.x && this.y === to.y && this.z === to.z)
  }
}

export class Velocity extends Moon{}

let time = 0
const MOONS = [
  [new Moon(-5,6,-11), new Velocity(0,0,0)],
  [new Moon(-8,-4,-2), new Velocity(0,0,0)],
  [new Moon(1,16,4), new Velocity(0,0,0)],
  [new Moon(11,11,-4), new Velocity(0,0,0)]
]

console.log(`Time: ${time}`)
console.dir(MOONS)

const calculateAxis = (axis: 'x' | 'y' | 'z', current: number, target: Moon, sample: Moon): number => {
  if(sample[axis] > target[axis]){
    return current + 1
  }

  if(sample[axis] < target[axis]){
    return current - 1
  }

  return current
}

const calculateVelocity = (index: number) => {
  const velocity = MOONS[index][1]
  const moon = MOONS[index][0]

  MOONS.forEach((entry, i) => {
    if(i !== index){
      velocity.x = calculateAxis('x', velocity.x, moon, entry[0])
      velocity.y = calculateAxis('y', velocity.y, moon, entry[0])
      velocity.z = calculateAxis('z', velocity.z, moon, entry[0])
    }
  })

  return velocity
}

const simulate = () => {
  MOONS.forEach((entry, i) => {
    entry[1] = calculateVelocity(i)
  })

  MOONS.forEach((entry) => {
    entry[0].x = entry[0].x + entry[1].x
    entry[0].y = entry[0].y + entry[1].y
    entry[0].z = entry[0].z + entry[1].z
  })

  time++
  //console.log(`Time: ${time}`)
  //console.dir(MOONS)
}

const calculateEnergy = () => {
  let total = 0

  MOONS.forEach(([moon, velocity]) => {
    const mE = Math.abs(moon.x) + Math.abs(moon.y) + Math.abs(moon.z)
    const vE = Math.abs(velocity.x) + Math.abs(velocity.y) + Math.abs(velocity.z)

    total += (mE * vE)
  })

  console.log(total)
}

while(time < 1000){
  simulate()
}

calculateEnergy()