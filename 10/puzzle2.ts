import {Point} from '../utils/positions'

type MapValue = "#" | "."

const ASTEROIDS: Point[] = []
const MAP: MapValue[][] = 
`.#..#..#..#...#..#...###....##.#....
.#.........#.#....#...........####.#
#..##.##.#....#...#.#....#..........
......###..#.#...............#.....#
......#......#....#..##....##.......
....................#..............#
..#....##...#.....#..#..........#..#
..#.#.....#..#..#..#.#....#.###.##.#
.........##.#..#.......#.........#..
.##..#..##....#.#...#.#.####.....#..
.##....#.#....#.......#......##....#
..#...#.#...##......#####..#......#.
##..#...#.....#...###..#..........#.
......##..#.##..#.....#.......##..#.
#..##..#..#.....#.#.####........#.#.
#......#..........###...#..#....##..
.......#...#....#.##.#..##......#...
.............##.......#.#.#..#...##.
..#..##...#...............#..#......
##....#...#.#....#..#.....##..##....
.#...##...........#..#..............
.............#....###...#.##....#.#.
#..#.#..#...#....#.....#............
....#.###....##....##...............
....#..........#..#..#.......#.#....
#..#....##.....#............#..#....
...##.............#...#.....#..###..
...#.......#........###.##..#..##.##
.#.##.#...##..#.#........#.....#....
#......#....#......#....###.#.....#.
......#.##......#...#.#.##.##...#...
..#...#.#........#....#...........#.
......#.##..#..#.....#......##..#...
..##.........#......#..##.#.#.......
.#....#..#....###..#....##..........
..............#....##...#.####...##.`.split('\n').map((row) => row.split('')) as any

const X = MAP[0].length
const Y = MAP.length

const position = (x: number, y: number) => {
  return MAP[y][x]
}

const asteroid = (x: number, y: number) => {
  return position(x, y) === "#"
}

const inVision = (point: Point): {count: number, results: {[angle: number]: Point[]}} => {
  const results: {[angle: number]: Point[]} = {}

  ASTEROIDS.forEach((asteroid) => {
    if(!asteroid.equal(point)){
      const tR = point.angleTo(asteroid)

      if(!results[tR]){
        results[tR] = []
      }

      results[tR].push(asteroid)
      results[tR] = results[tR].sort((a,b) => {
        return a.distance(point) - b.distance(point)
      })
    }
  })

  return {count: Object.keys(results).length, results}
}

let x = 0
let y = 0
while(x < X){
  while(y < Y){
    if(asteroid(x,y)){
      ASTEROIDS.push(new Point(x, y))
    }

    y++
  }

  y = 0
  x++
}

const best = ASTEROIDS.reduce((best, point) => {
  const {count} = inVision(point)

  if(count > best.count){
    return {count, point}
  }

  return best
}, {count: 0, point: new Point(0,0)})

const getAngles = (results: any) => {
  return Object.keys(results).map((v) => parseFloat(v)).sort((a, b) => {
    return a - b
  })
}

const nextAngle = (angle: number, angles: number[]): number => {
  /*const above = angles.filter((a) => {
    return a + 180 > angle + 180
  })

  if(above.length > 0){
    return above[0]
  }

  return angles.filter((a) => {
    return a + 180 > 0
  })[0]*/

  const less = angles.filter((a) => {
    return a + 360 < angle + 360
  })

  const next =  Math.max(...less)

  if(next === -Infinity){
    return nextAngle(181, angles)
  }

  return next
}

console.dir(best.point)

const laser = best.point
let angle = 90
let {results} = inVision(laser)
let angles = getAngles(results)
let destroyed: Point[] = []

/**
 * Some Logical thinking
 * 
 * "up" is 90deg and clockwise is 90->0->270->180->90
 */

const run = () => {
  console.log(`PULSE ${angle} ${ASTEROIDS.length - 1 - destroyed.length} remaining`)
  const a = angle.toString(10)

  const roid = results[a].shift()

  destroyed.push(roid)
  if(results[a].length === 0){
    delete results[a]
  }

  angles = getAngles(results)
  
  if(angles.length !== 0){
    angle = nextAngle(angle, angles)
  }
}

let i = 0
for(i=0;i<ASTEROIDS.length - 1;i++){
  run()
}

console.log((destroyed[199].x * 100) + destroyed[199].y)
