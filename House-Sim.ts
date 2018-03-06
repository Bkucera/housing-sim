import Engine from "./Engine"
import params from "./config"

let filter = params.filterLogs
const log = (logStr:string) => {
  if (!filter) return console.log(logStr)
  if(logStr.split(' ').indexOf(filter)!== -1) console.log(logStr)
}

let outs = {
  totalTimeBuy: 0,
  totalTimeSell: 0,
  failedPurchases: 0,
  successfulPurchases: 0
}

var genName = (() => {
  let count = 0
  return () => {
    return "P" + count++
  }
})()

let engine = new Engine()

class SellerQueue {
  constructor(public list: Seller[] = []) {}
  add(seller: Seller) {
    this.list.push(seller)
  }
  newSeller() {
    if (this.list.length < params.numSellers) {
      this.add(new Seller())
      engine.schedule(engine.currentTime() + 1, () => this.newSeller())
    }
  }
}
class BuyerQueue {
  constructor(public list: Buyer[] = []) {
    // this.promptToLook()
  }
  add(buyer: Buyer) {
    this.list.push(buyer)
  }
  newBuyer() {
    if (this.list.length < params.numBuyers) {
      this.add(new Buyer())
      engine.schedule(engine.currentTime() + 5, () => this.newBuyer())
    }
  }
  // promptToLook() {
  //   engine.schedule(engine.currentTime() + 15, () => {
  //     this.list.forEach(buyer => buyer.browseProperties())
  //   })
  //   if (engine.currentTime() <= params.runtime) {
  //     engine.schedule(engine.currentTime() + 5, () => {
  //       this.promptToLook()
  //     })
  //   }
  // }
}

let sellerQueue = new SellerQueue()
let buyerQueue = new BuyerQueue()

class Buyer {
  constructor(
    public bias: number = genBias(),
    public budgetPrice: number = genBudgetPrice(),
    public name: string = genName(),
    public initTime: number = engine.currentTime(),
    public time: number = engine.currentTime(),
    public inQueue: boolean = true
  ) {
    log(`Buyer  ${this.name} has entered the market!`)
    this.browseProperties()
  }
  willingToVisitRange() {
    return { min: this.budgetPrice - 1000, max: this.budgetPrice + 1000 }
  }
  browseProperties() {
    let len = sellerQueue.list
      .filter(
        seller =>
          seller.postingPrice >= this.willingToVisitRange().min &&
          seller.postingPrice <= this.willingToVisitRange().max
      )
      .map(seller => this.visitProperty(seller)).length

    engine.schedule(engine.currentTime() + len + 1 * 10, () => {
      this.browseProperties()
    })
  }
  failedBuy(diff) {
    log(`${this.name} visited but did not buy: overprice $${diff}`)
    outs.failedPurchases++
    // outs.totalTimeBuy += engine.currentTime()-this.time
    this.time = engine.currentTime()
    this.bias += 0.02 + this.timeSinceInit() / 30
    this.budgetPrice += this.bias * this.budgetPrice
  }
  timeSinceInit() {
    return engine.currentTime() - this.initTime
  }
  bought(seller, price) {
    log(`${this.name} bought from ${seller.name} for $${price}`)
    this.budgetPrice = -10000
    outs.totalTimeBuy += this.timeSinceInit()
    outs.successfulPurchases += 1
    this.inQueue = false
    engine.schedule(engine.currentTime() + 100, () =>
      sellerQueue.add(new Seller(undefined, price, this.name))
    )
  }
  visitProperty(seller: Seller) {
    log(this.name + " visited property")
    engine.schedule(engine.currentTime() + 5, () => {
      let sold: number
      let diff =
        seller.postingPrice +
        params.commissionRate * seller.postingPrice -
        this.budgetPrice
      let sellerLeeway = seller.bias * 1000
      let buyerLeeway = this.bias * 1000
      if (diff < 0) {
        //if buyer gets a good deal
        if (Math.abs(diff) > sellerLeeway) {
          engine.schedule(engine.currentTime() + 5, () => {
            seller.failedSale()
            this.failedBuy(diff)
          })
        } else {
          let price = this.budgetPrice - sellerLeeway
          this.bought(seller, price)
          seller.sold(this, price)
        }
      } else {
        //if seller gets a good deal
        if (Math.abs(diff) > buyerLeeway) {
          engine.schedule(engine.currentTime() + 5, () => {
            seller.failedSale()
            this.failedBuy(diff)
          })
        } else {
          let price = this.budgetPrice + buyerLeeway
          this.bought(seller, price)
          seller.sold(this, price)
        }
      }
      sold =
        (Math.random() / 5 + 0.8) * (seller.postingPrice - this.budgetPrice)
    })
  }
}

class Seller {
  constructor(
    public bias: number = genBias(),
    public postingPrice: number = genPostingPrice(),
    public name: string = genName(),
    public house: number[] = genHouse(),
    public initTime: number = engine.currentTime(),
    public inQueue: boolean = true
  ) {
    log(`Seller ${this.name} has entered the market!`)
  }
  getHouseFeaturesValue = () => this.house.reduce((a, b) => a + b)
  getHouseValue = () => this.postingPrice + this.getHouseFeaturesValue()
  failedSale() {
    this.bias += 0.02 + this.timeSinceInit() / 200
    this.postingPrice -= this.bias * this.postingPrice
    // log(this.timeSinceInit())
  }
  timeSinceInit() {
    return engine.currentTime() - this.initTime
  }
  sold(buyer: Buyer, price) {
    this.postingPrice = null
    outs.totalTimeSell += this.timeSinceInit()
    this.inQueue = false
    engine.schedule(engine.currentTime() + 1000, () =>
      buyerQueue.add(new Buyer(undefined, price, this.name))
    )
  }
}

engine.schedule(engine.currentTime(), () => sellerQueue.newSeller())
engine.schedule(engine.currentTime(), () => buyerQueue.newBuyer())
engine.schedule(params.runtime, () => {
  // outs.avgTimeSell = outs.totalTimeSell/
  let nonBuyers = buyerQueue.list.filter(buyer => buyer.inQueue)
  let nonSellers = sellerQueue.list.filter(seller => seller.inQueue)
  let timeNonBuy =
    nonBuyers
      .map(non => engine.currentTime() - non.initTime)
      .reduce((a, b) => a + b, 0) / (nonBuyers.length || 1)
  let timeNonSell =
    nonSellers
      .map(non => engine.currentTime() - non.initTime)
      .reduce((a, b) => a + b, 0) / (nonSellers.length || 1)

  Object.assign(outs, {
    nonBuyers: nonBuyers.length,
    nonSellers: nonSellers.length,
    timeNonBuy,
    timeNonSell
  })

  log(JSON.stringify(outs, null, "   "))
  engine.end()
})
engine.runSim()

function genHouse(): number[] {
  return Array(Math.round(Math.random() * 10)).map(() =>
    Math.round(Math.random() * 2000)
  )
}

function genBias(): number {
  return Math.random()
}
function genPostingPrice(): number {
  return Math.round((Math.random() / 5 + 0.8) * 10000)
}
function genName2(): string {
  let firsts = [
    "Mike",
    "Sam",
    "Bill",
    "John",
    "Ben",
    "Emanuel",
    "Chris",
    "Stacey"
  ]
  let surs = [
    "Smith",
    "Wells",
    "Orms",
    "Brown",
    "Banks",
    "Davis",
    "Barns",
    "Davey",
    "Harvey",
    "Oswald",
    "Rice-aroni",
    "Sanders"
  ]
  let name =
    firsts[Math.floor(Math.random() * firsts.length)] +
    " " +
    surs[Math.floor(Math.random() * surs.length)]
  return name
}

function genBudgetPrice(): number {
  return Math.round((Math.random() / 5 + 0.8) * 10000)
}

function netSale(salePrice) {
  return (1 - params.commissionRate) * salePrice - params.FixedSaleCost
}
