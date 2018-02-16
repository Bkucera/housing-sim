import Engine from "./engine"

let engine = new Engine()

let NEvents = 0

const A = 20
const R = 5
const G = 70

let NARRIVALS = 5

let inTheAir = 0
let onTheGround = 0
let runwayFree = true
let ArrivalCount = 0

let totalWaitingTime = 0
let lastEventTime = 0

enum KindsOfEvents {
	ARRIVAL,
	DEPARTURE,
	LANDED
}

interface EventData {
	eventType : KindsOfEvents
}

function randExp(M:number) {
	let urand : number
	urand = Math.random()
	return -M * Math.log(1-urand)
}

function arrival(e:EventData) {
	let d : EventData
	let timestamp : number

	if (e.eventType != KindsOfEvents.ARRIVAL) {console.error('unexpected event type'); throw('errored')}
	console.log("Arrival Event: time = " + engine.currentTime)

	if (inTheAir > 1) {
		totalWaitingTime += (inTheAir-1) * (engine.currentTime()-lastEventTime)
	}
	NEvents++
	inTheAir++

	ArrivalCount++
	if (ArrivalCount < NARRIVALS) {
		d = {eventType: KindsOfEvents.ARRIVAL}
		timestamp = engine.currentTime() + randExp(A)
		engine.schedule(timestamp,d,arrival)
	}

	if (runwayFree) {
		runwayFree = false
		d = {eventType: KindsOfEvents.LANDED}
		timestamp = engine.currentTime() + R
		engine.schedule(timestamp,d,landed)
	}

	lastEventTime = engine.currentTime()
}

function landed(e:EventData) {
	let d : EventData
	let timestamp : number

	console.log("Landed Event: time " + engine.currentTime())

	if(inTheAir > 1) {
		totalWaitingTime += (inTheAir-1) * (engine.currentTime()-lastEventTime)
	}

	NEvents++
	inTheAir--
	onTheGround++

	timestamp = engine.currentTime() + G
	engine.schedule(timestamp,{eventType:KindsOfEvents.DEPARTURE}, departure)

	if (inTheAir > 0) {
		timestamp = engine.currentTime()+R
		engine.schedule(timestamp, {eventType:KindsOfEvents.LANDED},landed)
	} else {
		runwayFree = true
		console.log("runway is FREE")
	}

	lastEventTime = engine.currentTime()

}

function departure(e:EventData){
	console.log("Departure Event: time = " + engine.currentTime())

	if(inTheAir > 1) {
		totalWaitingTime += (inTheAir-1) * (engine.currentTime() - lastEventTime)
	}
	NEvents++
	onTheGround--
	lastEventTime = engine.currentTime()

}


// MAIN PROGRAM

function main() {
	let d : EventData
	let timestamp : number
	let duration : number

	d = {eventType: KindsOfEvents.ARRIVAL}
	timestamp = randExp(A)
	engine.schedule(timestamp, d, arrival)

	console.log("Welcome to the Airport")
	
	engine.runSim()

	console.log("Number of aircraft: " + NARRIVALS)
	console.log("Total waiting time: " + totalWaitingTime)
	console.log("Average waiting time: " + totalWaitingTime / NARRIVALS)
}


main()