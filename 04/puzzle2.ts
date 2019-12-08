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

const array = [0,1,2,3,4,5,6,7,8,9].map((n) => {
  let prefix: string

  switch(n){
    case 0:
      prefix = "(^|[1-9])"
      break;
    case 9:
      prefix = "(^|[0-8])"
      break;
    case 1:
      prefix = "(^|0|[2-9])"
      break;
    case 8:
      prefix = "(^|[0-7]|9)"
      break;
    default:
      prefix = `(^|[0-${n-1}]|[${n+1}-9])`
      break;
  }

  const suffix = prefix.replace('^', '$')

  return `(${prefix}[${n}]{2}${suffix})`
})

const regex = new RegExp(array.join("|"))

const double = (n: number) => {
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