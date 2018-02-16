interface EngEvent {
  timestamp: number;
  data: Object;
  callback: Function;
  next: EngEvent;
}

module.exports = Engine = () => {
  let _rootEvent = { timestamp: -1, data: null, callback: null, next: null };
  let _now = 0;

  const _pop = () : EngEvent => {
    let e: EngEvent;

    if (_rootEvent.next == null) return null;
    e = _rootEvent.next;
    _rootEvent.next = e.next;
    return e;
  }

  const _printList = (list: EngEvent) => {
    let p: EngEvent;

    console.log("Event List: ");
    for (p = list; p != null; p = p.next) {
      console.log(p.timestamp);
    }
    console.log("/n");
  }

  const currentTime = (): number => {
	return _now;
  }

  const schedule = (timestamp: number, data: Object, callback: Function) => {
	let e: EngEvent = { timestamp, data, callback, next: null };
	let q, p: EngEvent;
	for (
	  q = _rootEvent, p = _rootEvent.next;
	  p != null;
	  p = p.next, q = q.next
	) {
	  if (p.timestamp >= e.timestamp) break;
	}
	e.next = q.next;
	q.next = e;
  }

  const runSim = () => {
	let e: EngEvent;

	console.log("Initial event list: ");
	_printList(_rootEvent.next);

	while ((e = _pop()) != null) {
	  _now = e.timestamp;
	  e.callback(e.data);
	  e = null;
	}
  }

  return {currentTime, schedule, runSim};
};

// export default Engine

// export default class Engine {
//   rootEvent: EngEvent;
//   now: number;
//   constructor() {
//     this.rootEvent = { timestamp: -1, data: null, callback: null, next: null };
//     this.now = 0;
//   }

//   currentTime(): number {
//     return this.now;
//   }

//   schedule(timestamp: number, data: Object, callback: Function) {
//     let e: EngEvent = { timestamp, data, callback, next: null };
//     let q, p: EngEvent;
//     for (
//       q = this.rootEvent, p = this.rootEvent.next;
//       p != null;
//       p = p.next, q = q.next
//     ) {
//       if (p.timestamp >= e.timestamp) break;
//     }
//     e.next = q.next;
//     q.next = e;
//   }

//   private pop(): EngEvent {
//     let e: EngEvent;

//     if (this.rootEvent.next == null) return null;
//     e = this.rootEvent.next;
//     this.rootEvent.next = e.next;
//     return e;
//   }

//   private printList(list: EngEvent) {
//     let p: EngEvent;

//     console.log("Event List: ");
//     for (p = list; p != null; p = p.next) {
//       console.log(p.timestamp);
//     }
//     console.log("/n");
//   }

//   runSim() {
//     let e: EngEvent;

//     console.log("Initial event list: ");
//     this.printList(this.rootEvent.next);

//     while ((e = this.pop()) != null) {
//       this.now = e.timestamp;
//       e.callback(e.data);
//       e = null;
//     }
//   }
// }
