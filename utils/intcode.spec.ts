import {asyncForEach} from '@arcath/utils'

import {intcode, IDLE, WAIT_INPUT, WAIT_OUTPUT, HALTED} from './intcode'

import {BOOST} from '../programs/boost'

describe('INTCODE Computer', () => {
  it('should be promise based', async () => {
    const testInput = 10
    const computer = await intcode({program: "3,0,4,0,99"})

    expect(computer.state()).toBe(IDLE)

    await computer.run()

    expect(computer.state()).toBe(WAIT_INPUT)

    computer.input(testInput)

    await computer.run()

    expect(computer.state()).toBe(WAIT_OUTPUT)

    expect(computer.output()).toBe(testInput)

    expect(computer.dump()).toBe(`${testInput},0,4,0,99`)

    await computer.run()

    expect(computer.state()).toBe(HALTED)
  })

  it('should support opcode 9 and relative bases', async () => {
    const program = `109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99`
    const computer = await intcode({program, name: 'OPC9'})

    expect(computer.state()).toBe(IDLE)

    await asyncForEach(program.split(',').map((v) => parseInt(v)), async (location) => {
      await computer.run()

      expect(computer.state()).toBe(WAIT_OUTPUT)
      expect(computer.output()).toBe(location)
    })
  })

  it('should support 203 (BOOST OUTPUT)', async () => {
    const program = `9,1,203,2,4,3,99`
    const testInput = 86

    const computer = await intcode({program, initialInput: [testInput], name: 'T203'})

    await computer.run()

    expect(computer.output()).toBe(testInput)
  })

  it('should run the boost program', async () => {
    const computer = await intcode({program: BOOST, initialInput: [1], name: 'BOOST'})

    await computer.run()

    expect(computer.output()).toBe(2789104029)
  })
})

/*describe('INTCODE', () => {
  it('should run a simple program', () => {
    load('1,1,1,4,99,5,6,0,99')
    run()
    expect(dump()).toBe('30,1,1,4,2,5,6,0,99')

    load("1,12,2,3,1,1,2,3,1,3,4,3,1,5,0,3,2,10,1,19,1,6,19,23,2,23,6,27,1,5,27,31,1,31,9,35,2,10,35,39,1,5,39,43,2,43,10,47,1,47,6,51,2,51,6,55,2,55,13,59,2,6,59,63,1,63,5,67,1,6,67,71,2,71,9,75,1,6,75,79,2,13,79,83,1,9,83,87,1,87,13,91,2,91,10,95,1,6,95,99,1,99,13,103,1,13,103,107,2,107,10,111,1,9,111,115,1,115,10,119,1,5,119,123,1,6,123,127,1,10,127,131,1,2,131,135,1,135,10,0,99,2,14,0,0")
    run(12, 2)
    expect(read(0)).toBe(8017076)
  })

  it('should support opcode 3 & 4', () => {
    const testInput = 76

    load("3,0,4,0,99")
    input(testInput)
    run()
    expect(output()).toBe(testInput)
  })

  it('should support parameter modes', () => {
    load("1002,4,3,4,33")
    run()
    expect(dump()).toBe("1002,4,3,4,99")
  })

  it('should support 5-8', () => {
    // Test 5
    load("1105,10,5,3,1,3,0,99")
    input(1)
    run()
    expect(dump()).toBe("1,10,5,3,1,3,0,99")
    load("1105,0,5,3,1,99")
    input(1)
    run()
    expect(dump()).toBe("1105,1,5,3,1,99")

    // Test 6
    load("1106,0,5,3,1,3,0,99")
    input(1)
    run()
    expect(dump()).toBe("1,0,5,3,1,3,0,99")
    load("1106,9,5,3,1,99")
    input(1)
    run()
    expect(dump()).toBe("1106,1,5,3,1,99")

    // Test 7
    load("1107,6,6,0,99")
    run()
    expect(dump()).toBe("0,6,6,0,99")
    load("1107,5,6,0,99")
    run()
    expect(dump()).toBe("1,5,6,0,99")

    // Test 8
    load("1108,6,6,0,99")
    run()
    expect(dump()).toBe("1,6,6,0,99")
    load("1108,7,6,0,99")
    run()
    expect(dump()).toBe("0,7,6,0,99")

    // Example from page 1 if 8 0 if not
    load("3,9,8,9,10,9,4,9,99,-1,8")
    input(8)
    run()
    expect(output()).toBe(1)
    load("3,9,8,9,10,9,4,9,99,-1,8")
    input(7)
    run()
    expect(output()).toBe(0)

    //Example from page 1 if less than 8 0 if not
    load("3,9,7,9,10,9,4,9,99,-1,8")
    input(5)
    run()
    expect(output()).toBe(1)
    load("3,9,7,9,10,9,4,9,99,-1,8")
    input(8)
    run()
    expect(output()).toBe(0)
    load("3,9,7,9,10,9,4,9,99,-1,8")
    input(9)
    run()
    expect(output()).toBe(0)

    // Example from page, 1001 if more than 8, 1000 if 8 and 999 if less than 8
    load("3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99")
    input(9)
    run()
    expect(output()).toBe(1001)

    load("3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99")
    input(8)
    run()
    expect(output()).toBe(1000)

    load("3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99")
    input(7)
    expect(read(46)).toBe(99)
    run()
    expect(output()).toBe(999)
  })

  it('should support multiple inputs', () => {
    load("3,11,3,12,1,11,12,13,4,13,99,0,0,0")
    input(1)
    input(2)
    run()
    expect(output()).toBe(3)
  })
})*/