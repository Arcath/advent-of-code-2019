class Position{
  x: number
  y: number
  z: number

  equal(to: Position){
    return (this.x === to.x && this.y === to.y && this.z === to.z)
  }
}

class Moon extends Position{
  constructor(public x: number, public y: number, public z: number, public velocity: Velocity){
    super()
    this.xInit = x
    this.yInit = y
    this.zInit = z
  }

  xInit = 0
  yInit = 0
  zInit = 0

  energy(){
    const mE = Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z)
    const vE = Math.abs(this.velocity.x) + Math.abs(this.velocity.y) + Math.abs(this.velocity.z)

    return (mE * vE)
  }

  addVelocity(){
    this.x += this.velocity.x
    this.y += this.velocity.y
    this.z += this.velocity.z
  }

  reset(){
    this.x = 0 + this.xInit
    this.y = 0 + this.yInit
    this.z = 0 + this.zInit

    this.velocity = new Velocity(0, 0 ,0)
  }

  originalPosition(axis: 'x' | 'y' | 'z'){
    return this[axis] === this[`${axis}Init`] && this.velocity[axis] === 0
  }
}

class Velocity extends Position{
  constructor(public x: number, public y: number, public z: number){
    super()
  }
}

const lcm = (...numbers) => {
  const n = numbers.shift()

  let n2: number
  if(numbers.length > 1){
    n2 = lcm(...numbers)
  }else{
    n2 = numbers[0]
  }

  return (Math.abs(n * n2) / gcf(n, n2))
}

const gcf = (x: number, y: number) => {
  x = Math.abs(x)
  y = Math.abs(y)
  while(y) {
    var t = y
    y = x % y
    x = t
  }
  return x
}

let time = 0

const ZERO = new Position()
ZERO.x = 0
ZERO.y = 0
ZERO.z = 0

const MOONS = [
  new Moon(-5,6,-11, new Velocity(0,0,0)),
  new Moon(-8,-4,-2, new Velocity(0,0,0)),
  new Moon(1,16,4, new Velocity(0,0,0)),
  new Moon(11,11,-4, new Velocity(0,0,0))
]

const calculateEnergy = () => {
  return MOONS.reduce((total, moon) => {
    return total + moon.energy()
  }, 0)
}

const calculateAxis = (axis: 'x' | 'y' | 'z', current: number, target: Moon, sample: Moon): number => {
  if(sample[axis] > target[axis]){
    return current + 1
  }

  if(sample[axis] < target[axis]){
    return current - 1
  }

  return current
}

let moon: Moon
let velocity: Velocity
const calculateVelocity = (index: number) => {
  moon = MOONS[index]
  velocity = moon.velocity

  MOONS.forEach((entry, i) => {
    if(i !== index){
      velocity.x = calculateAxis('x', velocity.x, moon, entry)
      velocity.y = calculateAxis('y', velocity.y, moon, entry)
      velocity.z = calculateAxis('z', velocity.z, moon, entry)
    }
  })

  return velocity
}

const pointers = ['|', '/', '-', '\\']
let pointer = 0

const timeToZero = [0,0,0,0]

const simulate = () => {
  MOONS.forEach((entry, i) => {
    entry.velocity = calculateVelocity(i)
  })

  MOONS.forEach((entry, i) => {
    entry.addVelocity()
  })

  time++

  pointer++
  if(pointer === pointers.length){
    pointer = 0
  }
  process.stdout.clearLine(0)
  process.stdout.cursorTo(0)
  process.stdout.write(`${pointers[pointer]} Time: ${time}`)
}

const run = (f: number) => {
  let t = 0

  while(t < f){
    simulate()
    t++
  }

  return MOONS.reduce((c, moon) => {
    return c + moon.energy()
  }, 0)
}

const reset = () => {
  MOONS.forEach((moon) => {
    moon.reset()
  })
}

const originalPosition = (axis: 'x' | 'y' | 'z') =>{
  return MOONS.reduce((r, moon) => {
    return r && moon.originalPosition(axis)
  }, true)
}

// Sanity check to make sure that the simulations still work.
const e = run(10)

// Reset all the moons.
reset()
console.log('')


const steps = (['x', 'y', 'z'] as ('x' | 'y' | 'z')[]).reduce((s, axis) => {
  console.log(`Running for Axis ${axis}`)
  time = 0

  simulate()
  while(!originalPosition(axis)){
    simulate()
  }

  console.log('')

  reset()
  return lcm(s, time)
}, 1)

console.log(steps)

