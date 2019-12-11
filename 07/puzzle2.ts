import {asyncMap} from '@arcath/utils'

import {intcode, HALTED, IntCodeComputer, WAIT_OUTPUT} from '../utils/intcode'

const INPUT = "3,8,1001,8,10,8,105,1,0,0,21,34,43,60,81,94,175,256,337,418,99999,3,9,101,2,9,9,102,4,9,9,4,9,99,3,9,102,2,9,9,4,9,99,3,9,102,4,9,9,1001,9,4,9,102,3,9,9,4,9,99,3,9,102,4,9,9,1001,9,2,9,1002,9,3,9,101,4,9,9,4,9,99,3,9,1001,9,4,9,102,2,9,9,4,9,99,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,101,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,99,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,2,9,4,9,99,3,9,101,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,1001,9,1,9,4,9,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,99"
//const INPUT = "3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5"

const permutations = (array: number[]) => {
  const p = (array: number [], temp: number []) => {
      let i: number
      let x: number
      if (!array.length) {
          result.push(temp);
      }
      for (i = 0; i < array.length; i++) {
          x = array.splice(i, 1)[0];
          p(array, temp.concat(x));
          array.splice(i, 0, x);
      }
  }

  var result = [];
  p(array, []);
  return result as number[][];
}

const main = async () => {
  let max = 0
  //let permutation: number[] = []
  
  const results = await asyncMap(permutations([5, 6, 7, 8, 9]), async (order) => {
    const A = await intcode(INPUT, [order[0]], 'A')
    const B = await intcode(INPUT, [order[1]], 'B')
    const C = await intcode(INPUT, [order[2]], 'C')
    const D = await intcode(INPUT, [order[3]], 'D')
    const E = await intcode(INPUT, [order[4]], 'E')

    const runComputer = async (computer: IntCodeComputer, input: number) => {
      computer.input(input)
      await computer.run()

      if(computer.state() === HALTED){
        return 0
      }

      if(computer.state() === WAIT_OUTPUT){
        return computer.output()
      }
    }

    const run = async (n: number): Promise<number> => {
      console.log(`RUN Starting at ${n}`)
      
      const aOut = await runComputer(A, n)
      const bOut = await runComputer(B, aOut)
      const cOut = await runComputer(C, bOut)
      const dOut = await runComputer(D, cOut)
      let eOut = await runComputer(E, dOut)

      if(E.state() !== HALTED){
        const out = await run(eOut)
        return out
      }

      return n
    }

    const out = await run(0)

    return out
  })

  results.forEach((result) => {
    if(result > max){
      max = result
    }
  })

  console.log(max)
}

main()
