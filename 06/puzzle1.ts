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
K)L`.split("\n")*/

const db = new sodb<{code: string, children: string[]}>()

ORBITS.forEach((orbit) => {
  const [parent, child] = orbit.split(")")

  let parentRecord = db.findOne({code: parent})

  if(!parentRecord){
    parentRecord = db.add({code: parent, children: []})
  }

  parentRecord.children.push(child)

  db.add({code: child, children: []})
  db.update(parentRecord)
})

const COM = db.findOne({code: 'COM'})

const buildHash = (children: string[], level: number) => {
  let hash = 0

  children.forEach((code) => {
    hash += level

    const child = db.findOne({code})

    hash += buildHash(child.children, level + 1)
  })

  return hash
}

const hash = buildHash(COM.children, 1)

console.dir(hash)