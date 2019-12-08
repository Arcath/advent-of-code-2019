const MIN = 172851
const MAX = 675869

//const MIN = 110
//const MAX = 123

const decreases = (n : number) => {
  const s = n.toString(10)

  return s.split("").reduce((decreases, m, i, a) => {
    if(decreases){ return true }

    if(m < a[i-1]){
      return true
    }

    return false
  }, false)
}

const double = (n: number) => {
  const regex = new RegExp(/[1]{2}|[2]{2}|[3]{2}|[4]{2}|[5]{2}|[6]{2}|[7]{2}|[8]{2}|[9]{2}/)

  return !!regex.exec(n.toString(10))
}

let i = MIN
let j = 0

while(i <= MAX){
  if(!decreases(i) ){
    // i contains no decrease
    if(double(i)){
      // i contains a double
      j += 1
    }
  }

  i += 1
}

console.log(j)