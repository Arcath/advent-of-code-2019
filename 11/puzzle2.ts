import {intcode, HALTED, IntCodeComputer} from '../utils/intcode'
import {Point} from '../utils/positions'

import {HullPaint} from '../programs/hull-paint'

const Robot = {facing: 0, location: new Point(50, 2)}
Robot.location.color = '█'

const GRID = []

for(let y=0;y<10;y++){
  GRID[y] = []
  for(let x = 0;x<100;x++){
    GRID[y][x] = new Point(x, y)
    GRID[y][x].color = '.'
  }
}

const draw = () => {
  //process.stdout.cursorTo(0,0)

  GRID.forEach((row) => {
    row.forEach((point: Point) => {
      if(point.equal(Robot.location)){
        process.stdout.write('@')
      }else{
        process.stdout.write(point.color)
      }
    })
    process.stdout.write('\n')
  })
}

let painted: Point[] = []
const main = async () => {
  const computer = await intcode({program: HullPaint, name: 'HullPainting'})

  while(computer.state() !== HALTED){
    //draw()
    //await computer.sleep(100)
    await tick(computer)
  }

  draw()

  console.log(painted.length)

  const contains = (array: Point[], point: Point) => {
    return array.reduce((found, entry) => {
      return found || entry.equal(point)
    }, false)
  }

  const unique = (array: Point[]) => {
    const a: Point[] = []

    array.forEach((v) => {
      if(!contains(a, v)){
        a.push(v)
      }
    })

    return a
  }

  console.log(unique(painted).length)
}

const tick = async (computer: IntCodeComputer) => {
  const input = Robot.location.color === '.' ? 0 : 1
  computer.input(input)
  await computer.run()

  if(computer.state() === HALTED){
    return
  }

  const paint = computer.output()
  await computer.run()
  const direction = computer.output()

  computer.log(computer.ptr, `Paint: ${paint}`)

  painted.push(Robot.location)
  GRID[Robot.location.y][Robot.location.x].color = (paint === 1 ? '█' : '.')

  if(direction === 0){
    Robot.facing--
  }else{
    Robot.facing++
  }

  if(Robot.facing === -1){
    Robot.facing = 3
  }

  if(Robot.facing === 4){
    Robot.facing = 0
  }

  switch(Robot.facing){
    case 0:
      //console.dir([Robot.location.x, Robot.location.y - 1, Robot.facing, paint, input])
      Robot.location = GRID[Robot.location.y - 1][Robot.location.x]
    break;
    case 1:
      //console.dir([Robot.location.x - 1, Robot.location.y, Robot.facing, paint, input])
      Robot.location = GRID[Robot.location.y][Robot.location.x - 1]
    break;
    case 2:
      //console.dir([Robot.location.x, Robot.location.y + 1, Robot.facing, paint, input])
      Robot.location = GRID[Robot.location.y + 1][Robot.location.x]
    break;
    case 3:
      //console.dir([Robot.location.x + 1, Robot.location.y, Robot.facing, paint, input])
      Robot.location = GRID[Robot.location.y][Robot.location.x + 1]
    break;
  }

  computer.log(computer.ptr, `Robot ${Robot.location.x},${Robot.location.y}`)
}

main()