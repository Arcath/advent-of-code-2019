import leftPad from 'left-pad'

let PROGRAM: number[]
let programInput: number[] = []
let inputPtr = 0
let programOutput = 0

export const load = (input: string) => {
  PROGRAM = input.split(',').map((value) => parseInt(value))
}

export const dump = () => {
  return PROGRAM.join(',')
}

export const input = (n: number) => {
  programInput.push(n)
}

export const output = () => {
  return programOutput
}

export const read = (position: number) => {
  return PROGRAM[position]
}

export const write = (position: number, value: number) => {
  console.log(`write ${value} to ${position}`)
  PROGRAM[position] = value
}

export const readFrom = (ptr: number) => {
  const position = read(ptr)
  return read(position)
}

const paramRegex = /^([0-1])([0-1])([0-1])([0-9][0-9])$/

const readMode = (mode: number, ptr: number) => {
  return mode === 0 ? readFrom(ptr) : read(ptr)
}

const getInstruction = (opcode: string, length: number, ptr: number) => {
  const instruction = [opcode]

  let i = 1
  while(i <= length){
    instruction.push(read(ptr + i).toString(10))

    i++
  }

  return instruction.join()
}

const opCode = (ptr: number) => {
  let noun = 0
  let verb = 0
  let store = 0
  let nextPtr = 0
  let t1 = 0
  let t2 = 0
  let instruction: string

  let parameter = leftPad(read(ptr).toString(10), 5, '0')

  const matches = parameter.match(paramRegex)

  if(!matches){
    console.dir(parameter)
    console.dir(ptr)
    return {code: 99}
  }

  const [, m3, m2, m1, code] = matches.map((v) => {
    return parseInt(v)
  })

  switch(code){
    case 99:
      instruction = "99"
    break;
    case 1:
    case 2:
      store = m3 === 0 ? read(ptr + 3) : read(ptr + 3)
      noun = readMode(m1, ptr + 1)
      verb = readMode(m2, ptr + 2)
      nextPtr = ptr + 4
      instruction = getInstruction(parameter, 3, ptr)
    break;
    case 3:
      store = read(ptr + 1)
      noun = programInput[inputPtr]
      inputPtr += 1
      nextPtr = ptr + 2
      instruction = getInstruction(parameter, 1, ptr)
    break;
    case 4:
      nextPtr = ptr + 2
      noun = readMode(m1, ptr + 1)
      instruction = getInstruction(parameter, 1, ptr)
    break;
    case 5:
      noun = readMode(m1, ptr + 1)
      nextPtr = noun === 0 ? ptr + 3 : readMode(m2, ptr + 2)
      instruction = getInstruction(parameter, 2, ptr)
    break;
    case 6:
      noun = readMode(m1, ptr + 1)
      nextPtr = noun !== 0 ? ptr + 3 : readMode(m2, ptr + 2)
      instruction = getInstruction(parameter, 2, ptr)
    break;
    case 7:
      store = m3 === 0 ? read(ptr + 3) : read(ptr + 3)
      t1 = readMode(m1, ptr + 1)
      t2 = readMode(m2, ptr + 2)
      noun = t1 < t2 ? 1 : 0
      nextPtr = ptr + 4
      instruction = getInstruction(parameter, 3, ptr)
    break;
    case 8:
      store = m3 === 0 ? read(ptr + 3) : read(ptr + 3)
      t1 = readMode(m1, ptr + 1)
      t2 = readMode(m2, ptr + 2)
      noun = t1 === t2 ? 1 : 0
      nextPtr = ptr + 4
      instruction = getInstruction(parameter, 3, ptr)
    break;
  }

  //console.log(`${ptr}: ${instruction}`)

  return {code, noun, verb, store, nextPtr, instruction}
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
      case 7:
      case 8:
        write(store, noun)
      break;
      case 4:
        programOutput = noun
      break;
      case 5:
      case 6:
        // NO-OP
      break;
      case 99:
      default:
        run = false
      break;
    }

    ptr = nextPtr
  }
}
