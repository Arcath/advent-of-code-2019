import sodb from 'sodb'

import {ORBITS} from './data'

/*const ORBITS = `COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L
K)YOU
I)SAN`.split("\n")*/

const db = new sodb<{code: string, children: string[], parent: string}>()

ORBITS.forEach((orbit) => {
  const [parent, child] = orbit.split(")")

  let parentRecord = db.findOne({code: parent})
  let childRecord = db.findOne({code: child})

  if(!parentRecord){
    parentRecord = db.add({code: parent, children: [], parent: ''})
  }

  if(!childRecord){
    childRecord = db.add({code: child, children: [], parent})
  }

  parentRecord.children.push(child)
  childRecord.parent = parent
  
  db.update(parentRecord)
  db.update(childRecord)
})

const ME = db.findOne({code: 'YOU'})

const pathToSanta = (code: string): string[] | false => {
  const body = db.findOne({code})

  if(body.children.includes('SAN')){
    return [code]
  }

  let result: string[] | false = false

  body.children.forEach((child) => {
    const test = pathToSanta(child)

    if(test){
      result = [child].concat(test)
    }
  })

  return result
}

const findSanta = (code: string, depth: number) => {
  const body = db.findOne({code})
  
  const path = pathToSanta(body.code)

  let result : number

  if(path){
    result = depth + path.length -1
  }else{
    result = findSanta(body.parent, depth + 1)
  }

  return result
}

console.log(findSanta(ME.parent, 0))