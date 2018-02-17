import Engine from './Housing-engine'
const params = {
  commissionRate: .03,
  travelCost: 100,
  FixedSaleCost: 500,
  numBuyers: 100,
  numSellers: 10,
  runtime: 10000,
}

let outs = {
  soldCount: 0,
  totalTimeBuy: 0,
  totalTimeSell: 0,
  failedPurchases: 0
}
let engine = new Engine()


class SellerQueue {
  constructor(public list:Seller[]=[]){
    
  }
  add(seller:Seller) {
    this.list.push(seller)
  }
  newSeller(){
    if(this.list.length < params.numSellers) {
      this.add(new Seller())
      engine.schedule(engine.currentTime()+5,()=>this.newSeller())
    }
  }
}
class BuyerQueue {
  constructor(public list:Buyer[]=[]){
    this.promptToLook()
  }
  add(buyer:Buyer) {
    this.list.push(buyer)
  }
  newBuyer(){
    if(this.list.length < params.numBuyers) {
      this.add(new Buyer())
      engine.schedule(engine.currentTime()+5,()=>this.newBuyer())

    }
  }
  promptToLook(){
    engine.schedule(engine.currentTime()+15, ()=>{
      this.list.forEach(buyer=>buyer.browseProperties())
    })
    if (engine.currentTime() <= params.runtime) {
      engine.schedule(engine.currentTime()+30,()=>{
        this.promptToLook()
      })
    }
  }
}

let sellerQueue = new SellerQueue()
let buyerQueue = new BuyerQueue()

class Buyer {
  constructor(
    public bias:number=genBias(),
    public budgetPrice:number=genBudgetPrice(),
    public name:string=genName(),
    public time:number=0
  ){
    console.log(`Buyer  ${this.name} has entered the market!`)

  }
  willingToVisitRange() {
    return {min:this.budgetPrice-1000,max:this.budgetPrice+1000}
  }
  browseProperties() {
    sellerQueue.list.filter(seller=>seller.postingPrice>=this.willingToVisitRange().min && seller.postingPrice<=this.willingToVisitRange().max)
    .forEach(seller=>
      this.visitProperty(seller)
    )
  }
  failedBuy(){
    console.log(`${this.name} visited but did not buy`)
    outs.failedPurchases++
    this.bias+=.1
    this.time+=5
  }
  bought(seller, price){
    console.log(`${this.name} bought from ${seller.name} for $${price}`)
    this.budgetPrice = -10000
    outs.totalTimeBuy += this.time
    outs.soldCount += 1
  }
  visitProperty(seller:Seller) {
    console.log(this.name + ' visited property')
    engine.schedule(engine.currentTime()+5,()=>{

      let sold : number
      let diff = seller.postingPrice - this.budgetPrice
      let sellerLeeway = seller.bias*1000
      let buyerLeeway = this.bias*1000
      if (diff < 0) { //if buyer gets a good deal
        if (Math.abs(diff) > sellerLeeway) {
          engine.schedule(engine.currentTime()+5, ()=>{
            seller.failedSale()
            this.failedBuy()
          })
        }
        else {
          let price = this.budgetPrice - sellerLeeway
          this.bought(seller,price)
          seller.sold(this,price)
        }
      } else {
        if(Math.abs(diff) > buyerLeeway) {
          engine.schedule(engine.currentTime()+5,()=>{
            // console.log('failed: diff gt 0 '+diff)

            seller.failedSale()
            this.failedBuy()
          })
        }
        else {
          let price = this.budgetPrice + buyerLeeway
          this.bought(seller,price)
          seller.sold(this,price)
        }
      }
      sold = (Math.random()/5+.8)*(seller.postingPrice-this.budgetPrice)
    })
  }

}

class Seller {
  constructor(
    public bias:number=genBias(),
    public postingPrice:number=genPostingPrice(),
    public name:string=genName(),
    public house:number[]=genHouse(),
    public time:number=0
  ){
    console.log(`Seller ${this.name} has entered the market!`)
  }
  getHouseFeaturesValue = () => this.house.reduce((a,b)=>a+b)
  getHouseValue = ()=> this.postingPrice + this.getHouseFeaturesValue()
  failedSale(){
    this.bias+=.1
    this.time+=5
  }
  sold(buyer:Buyer, price) {
    this.postingPrice = 1000000
    outs.totalTimeSell += this.time
  }



}


engine.schedule(engine.currentTime(), ()=>sellerQueue.newSeller())
engine.schedule(engine.currentTime(), ()=>buyerQueue.newBuyer())
engine.schedule(params.runtime,()=>console.log(JSON.stringify(outs)))
engine.runSim()

function genHouse():number[]{
  return Array(Math.round(Math.random()*10)).map(()=>Math.round(Math.random()*2000))
}

function genBias() : number {
  return Math.random()
}
function genPostingPrice():number{
  return Math.round((Math.random()/5+.8)*10000)
}
function genName():string{
  let firsts = ['Mike','Sam','Bill','John','Ben','Emanuel','Chris','Stacey']
  let surs = ['Smith','Wells','Orms','Brown','Banks','Davis','Barns','Davey','Harvey','Oswald','Rice-aroni','Sanders']
  let name = firsts[Math.floor(Math.random()*firsts.length)] + " " +
  surs[Math.floor(Math.random()*surs.length)]
  return name
}

function genBudgetPrice():number {
  return Math.round((Math.random()/5+.8)*10000)
}

function netSale(salePrice) {
  return (1-params.commissionRate)*salePrice - params.FixedSaleCost
}