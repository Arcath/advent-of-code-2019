import {load, run, dump, read, input, output} from './intcode'

describe('INTCODE', () => {
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
})