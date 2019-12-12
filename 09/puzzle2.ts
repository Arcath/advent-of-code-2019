import {intcode} from '../utils/intcode'

import {BOOST as program} from '../programs/boost'

const main = async () => {
  const computer = await intcode({program, initialInput: [2], name: 'BOOST'})

  await computer.run()

  console.log(computer.output())
}

main()