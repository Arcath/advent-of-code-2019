import leftPad from 'left-pad'

export const IDLE = "idle"
export const RUNNING = "running"
export const WAIT_INPUT = "input"
export const WAIT_OUTPUT = "output"
export const HALTED = "halted"

type IntCodeState =
  typeof IDLE |
  typeof RUNNING |
  typeof WAIT_INPUT |
  typeof WAIT_OUTPUT |
  typeof HALTED

export interface IntCodeComputer{
  load: (input: string) => void
  dump: () => string
  state: () => IntCodeState
  read: (location: number) => number
  write: (location: number, value: number) => void
  run: () => Promise<void>
  output: () => number
  input: (input: number) => void
}

export const intcode = async (program: string, initialInput?: number[], name: string = 'INT'): Promise<IntCodeComputer> => {
  let PROGRAM: number[]
  const INPUTS: number[] = initialInput ? initialInput : []
  let STATE: IntCodeState = IDLE
  const paramRegex = /^([0-1])([0-1])([0-1])([0-9][0-9])$/
  let out: number = 0

  const log = (ptr: number, instruction: string) => {
    process.stdout.clearLine(0)
    process.stdout.cursorTo(0)
    process.stdout.write(`${name}#${ptr}: ${instruction}`)

  }

  const load = (input: string) => {
    PROGRAM = input.split(',').map((value) => parseInt(value))
  }

  const dump = () => {
    return PROGRAM.join(',')
  }

  const read = (location: number) => {
    return PROGRAM[location]
  }

  const readFrom = (ptr: number) => {
    const position = read(ptr)
    return read(position)
  }
  
  const readMode = (mode: number, ptr: number) => {
    return mode === 0 ? readFrom(ptr) : read(ptr)
  }

  const write = (position: number, value: number) => {
    log(ptr, `write ${value} to ${position}`)
    PROGRAM[position] = value
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

  const getInput = () => {
    if(INPUTS.length > 0){
      return INPUTS.shift()
    }

    return false
  }
  
  const opCode = async (ptr: number) => {
    let noun = 0
    let verb = 0
    let store = 0
    let nextPtr = 0
    let t1 = 0
    let t2 = 0
    let instruction: string
    let pause = false
  
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
        const input = getInput()

        if(input === false){
          STATE = WAIT_INPUT
          return {pause: true}
        }

        store = read(ptr + 1)
        noun = input
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
  
   log(ptr, instruction)
  
    return {code, noun, verb, store, nextPtr, instruction, pause}
  }

  const state = () => {
    return STATE
  }

  const output = () => {
    return out
  }

  const input = (inp: number) => {
    INPUTS.push(inp)
  }

  let ptr = 0
  const run = async () => {
    let exec = true

    while(exec && ptr < PROGRAM.length){
      const result = await opCode(ptr)

      if(result.pause){
        exec = false

        continue;
      }

      const {code, noun, verb, store, nextPtr} = result

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
          console.log(`${name}: OUTPUT ${noun}`)
          out = noun
          exec = false
          STATE = WAIT_OUTPUT
        break;
        case 5:
        case 6:
          // NO-OP
        break;
        case 99:
          STATE = HALTED
        default:
          exec = false
        break;
      }

      ptr = nextPtr
    }

    console.log(`${name} changing to state ${STATE}`)
  }

  load(program)

  return {
    load,
    dump,
    state,
    read,
    run,
    output,
    write,
    input
  }
}