export class Point{
  index: number

  constructor(public x: number, public y: number){}

  distance(from: Point){
    return (Math.abs(this.x - from.x) + Math.abs(this.y - from.y))
  }

  equal(to: Point){
    return (this.x === to.x && this.y === to.y)
  }

  angleTo(to: Point){
    const dX = to.x - this.x
    const dY = this.y - to.y
    const tR = Math.atan2(dY, dX)

    return (tR * (180/Math.PI))
  }
}