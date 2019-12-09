import leftPad from 'left-pad'

let PROGRAM: number[]
let programInput = 0
let programOutput = 0

export const load = (input: string) => {
  PROGRAM = input.split(',').map((value) => parseInt(value))
}

export const dump = () => {
  return PROGRAM.join(',')
}

export const input = (n: number) => {
  programInput = n
}

export const output = () => {
  return programOutput
}

export const read = (position: number) => {
  return PROGRAM[position]
}

export const write = (position: number, value: number) => {
  PROGRAM[position] = value
}

export const readFrom = (ptr: number) => {
  const position = read(ptr)
  return read(position)
}

const paramRegex = /^([0-1])([0-1])([0-1])([0-9][0-9])$/

const opCode = (ptr: number) => {
  let noun = 0
  let verb = 0
  let store = 0
  let nextPtr = 0

  let parameter = leftPad(read(ptr).toString(10), 5, '0')

  const [, m3, m2, m1, code] = parameter.match(paramRegex).map((v) => {
    return parseInt(v)
  })

  switch(code){
    case 99:
    break;
    case 1:
    case 2:
      store = m3 === 0 ? read(ptr + 3) : read(ptr + 3)
      noun = m1 === 0 ? readFrom(ptr + 1) : read(ptr + 1)
      verb = m2 === 0 ? readFrom(ptr + 2) : read(ptr + 2)
      nextPtr = ptr + 4
    break;
    case 3:
      store = read(ptr + 1)
      noun = programInput
      nextPtr = ptr + 2
    break;
    case 4:
      nextPtr = ptr + 2
      noun = readFrom(ptr + 1)
    break;
  }

  return {code, noun, verb, store, nextPtr}
}

export const run = (noun?: number, verb?: number) => {
  let ptr = 0
  let run = true

  if(noun) PROGRAM[1] = noun
  if(verb) PROGRAM[2] = verb

  while(run && ptr < PROGRAM.length){
    const {code, store, noun, verb, nextPtr} = opCode(ptr)

    switch(code){
      case 1:
        write(store, noun + verb)
      break;
      case 2:
        write(store, noun * verb)
      break;
      case 3:
        write(store, noun)
      break;
      case 4:
        programOutput = noun
      break;
      case 99:
      default:
        run = false
      break;
    }

    ptr = nextPtr
  }
}
