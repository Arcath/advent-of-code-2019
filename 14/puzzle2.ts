const KNOWN_REACTIONS = `1 XVCBM, 12 SWPQ => 7 VMWSR
10 SBLTQ, 14 TLDR => 6 HJFPQ
1 VWHXC, 2 GZDQ, 3 PCLMJ => 4 VJPLN
9 MGVG => 7 WDPF
1 FBXD, 5 FZNZR => 6 GZDQ
5 TJPZ, 1 QNMZ => 5 SWPQ
12 XWQW, 1 HJFPQ => 8 JPKNC
15 CPNC, 2 TXKRN, 2 MTVQD => 9 LBRSX
5 VJPLN, 1 VSTRK, 2 GFQLV => 5 NLZKH
1 TLDR => 4 TNRZW
2 VCFM => 7 FZNZR
1 PSTRV, 5 RTDV => 8 VCFM
2 PSTRV => 9 SFWJG
4 XWQW => 2 BHPS
1 ZWFNW, 19 JKRWT, 2 JKDL, 8 PCLMJ, 7 FHNL, 22 MSZCF, 1 VSTRK, 7 DMJPR => 1 ZDGF
22 XVCBM, 8 TBLM => 1 MTVQD
101 ORE => 1 WBNWZ
6 VNVXJ, 1 FBXD, 13 PCLMJ => 9 MGVG
13 SHWB, 1 WDPF, 4 QDTW => 6 FHNL
9 VSTRK => 2 VZCML
20 LZCDB => 7 KNPM
2 LBRSX, 9 GRCD => 3 SHWB
5 BHPS => 6 SQJLW
1 RTDV => 6 GRCD
6 SBLTQ, 6 XWQW => 5 CPNC
153 ORE => 3 RTDV
6 LZCDB, 1 SBLTQ => 3 PCLMJ
1 RTDV, 2 TJPZ => 5 LZCDB
24 QNMZ => 4 TXKRN
19 PCLMJ, 7 VNVXJ => 6 RKRVJ
12 RKRVJ, 11 QNMZ => 3 JKRWT
4 SFWJG => 9 FBXD
16 WDPF, 4 TXKRN => 6 DMJPR
3 QNMZ => 1 VSTRK
9 VSTRK => 4 ZWFNW
7 QBWN, 1 TLDR => 4 QDTW
7 VJPLN, 1 NLZKH, 15 JPKNC, 3 SHWB, 1 MSZCF, 3 VMWSR => 6 QDHGS
14 QXQZ => 7 XWQW
152 ORE => 9 TJPZ
1 PJVJ, 10 QBWN, 19 NLZKH => 6 MSZCF
21 TLDR, 13 VNVXJ, 5 BHPS => 4 QBWN
1 GZDQ, 6 GRCD => 9 TLDR
4 BHPS => 8 MZBL
1 FZNZR => 2 VNVXJ
1 VNVXJ => 5 GFQLV
13 LZCDB => 2 QXQZ
3 MNFJX => 5 VWHXC
1 GZDQ, 2 VMWSR => 6 WZMHW
9 HJFPQ, 3 RKRVJ => 4 QNMZ
8 TJPZ => 9 SBLTQ
30 WBNWZ => 5 TBLM
1 PCLMJ => 3 GNMTQ
30 SQJLW, 3 QNMZ, 9 WDPF => 5 PJVJ
10 GRCD, 15 SBLTQ, 22 GFQLV => 4 XVCBM
30 PJVJ, 10 JPKNC, 3 DXFDR, 10 VZCML, 59 MZBL, 40 VWHXC, 1 ZDGF, 13 QDHGS => 1 FUEL
4 GNMTQ, 6 VMWSR, 19 RKRVJ, 5 FKZF, 4 VCFM, 2 WZMHW, 7 KNPM, 5 TNRZW => 7 DXFDR
152 ORE => 9 PSTRV
2 BHPS, 5 TXKRN, 2 PJVJ => 4 FKZF
2 XWQW, 2 VCFM, 13 BHPS => 8 MNFJX
3 XWQW => 2 JKDL`

const ORE_IN_HOLD = 1000000000000

interface Costs{
  [chemical: string]: number
}

interface Chemical{
  qty: number
  chemical: string
}

class Reaction{
  output: Chemical
  inputs: Chemical[]

  constructor(descriptor: string){
    const [inputs, output] = descriptor.split(' => ')

    this.output = this.parse(output)
    this.inputs = inputs.split(", ").map((chemical) => {
      return this.parse(chemical)
    })
  }

  parse(descriptor: string): Chemical{
    const [qty, chemical] = descriptor.split(' ')

    return {
      qty: parseInt(qty),
      chemical
    }
  }

  hasInput(chemical: string){
    return this.inputs.reduce((r, chem) => {
      return r || chem.chemical === chemical
    }, false)
  }

  costToMake(count: number): [number, Costs]{
    const actual = this.output.qty * Math.ceil(count/this.output.qty)
    const factor = actual / this.output.qty
    const results: Costs = {}
    this.inputs.forEach((input) => {
      results[input.chemical] = input.qty * factor
    })

    const leftover = actual - count

    return [leftover, results]
  }

  base(){
    return this.inputs.length === 1 && this.inputs[0].chemical === 'ORE'
  }

  totalInputCost(qty: number, leftovers: Costs): [Costs, number, Costs]{
    let [leftover, cost] = this.costToMake(qty - leftovers[this.output.chemical])

    leftovers[this.output.chemical] = leftover

    let toCost = Object.assign({}, cost)

    while(Object.keys(toCost).length !== 0){
      const chemical = Object.keys(toCost)[0]

      const reaction = getReactionForChemical(chemical)
  
      let [l, c] = reaction.costToMake(toCost[chemical] - leftovers[chemical])

      leftovers[chemical] = l

      cost = mergeCosts(cost, c)
      delete toCost[chemical]
      toCost = mergeCosts(toCost, c)
      delete toCost['ORE']
    }

    let ore = 0
    Object.keys(cost).forEach((chem) => {
      const reaction = getReactionForChemical(chem)

      if(reaction && reaction.base()){
        ore += reaction.costToMake(cost[chem])[1].ORE
      }
    })

    return [cost, ore, leftovers]
  }

  findProduceForOre(ore: number){
    const leftovers: Costs = {}

    // Set all leftovers to 0
    REACTIONS.forEach((reaction) => {
      leftovers[reaction.output.chemical] = 0
    })

    let [, singleCost] = this.totalInputCost(1, leftovers)
    let min = ore / singleCost
    let max = min * 2

    while(true){
      let units = Math.round((min + max) / 2)
      //console.log([min, units, max])

      const leftovers: Costs = {}

      // Set all leftovers to 0
      REACTIONS.forEach((reaction) => {
        leftovers[reaction.output.chemical] = 0
      })

      const [, cost] = this.totalInputCost(units, leftovers)
      //console.log(cost)

      if(cost === ore){
        return units
      }

      if(cost > ore){
        max = units
        continue;
      }

      if(cost < ORE_IN_HOLD - singleCost){
        min = units
        continue;
      }

      REACTIONS.forEach((reaction) => {
        leftovers[reaction.output.chemical] = 0
      })

      const [, costPlus] = this.totalInputCost(units + 1, leftovers)
      //console.log(costPlus)

      if(cost < ore && costPlus > ore){
        return units
      }

      if(cost < ore){
        min = units
      }else{
        max = units
      }
    }
  }
}

const getReactionForChemical = (chemical: string) => {
  return REACTIONS.filter((reaction) => {
    return reaction.output.chemical === chemical
  })[0]
}

const REACTIONS: Reaction[] = KNOWN_REACTIONS.split('\n').map((reaction) => {
  return new Reaction(reaction)
})

const mergeCosts = (base: Costs, merge: Costs) => {
  const costs = Object.assign({}, base)

  Object.keys(merge).forEach((chemical) => {
    if(!costs[chemical]){
      costs[chemical] = 0
    }

    costs[chemical] += merge[chemical]
  })

  return costs
}

const FUEL = getReactionForChemical('FUEL')

const leftovers: Costs = {}

// Set all leftovers to 0
REACTIONS.forEach((reaction) => {
  leftovers[reaction.output.chemical] = 0
})

const [costs, ore] = FUEL.totalInputCost(1, leftovers)

console.dir(ore)

// Set all leftovers to 0
REACTIONS.forEach((reaction) => {
  leftovers[reaction.output.chemical] = 0
})

console.dir(FUEL.findProduceForOre(ORE_IN_HOLD))