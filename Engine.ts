interface EngEvent {
  timestamp: number;
  callback: Function;
  next: EngEvent;
}

export default class Engine {
  rootEvent: EngEvent;
  now: number;
  constructor() {
    this.rootEvent = { timestamp: -1, callback: null, next: null };
    this.now = 0;
  }

  currentTime(): number {
    return this.now;
  }

  schedule(timestamp: number, callback: Function) {
    let e: EngEvent = { timestamp, callback, next: null };
    let q, p: EngEvent;
    for (
      q = this.rootEvent, p = this.rootEvent.next;
      p != null;
      p = p.next, q = q.next
    ) {
      if (p.timestamp >= e.timestamp) break;
    }
    e.next = q.next;
    q.next = e;
  }

  private pop(): EngEvent {
    let e: EngEvent;

    if (this.rootEvent.next == null) return null;
    e = this.rootEvent.next;
    this.rootEvent.next = e.next;
    return e;
  }

  private printList(list: EngEvent) {
    let p: EngEvent;

    console.log("Event List: ");
    for (p = list; p != null; p = p.next) {
      console.log(p.timestamp);
    }
    console.log("/n");
  }

  runSim() {
    let e: EngEvent;

    console.log("Initial event list: ");
    this.printList(this.rootEvent.next);

    while ((e = this.pop()) != null) {
      this.now = e.timestamp;
      e.callback();
      e = null;
    }
  }
  end() {
    this.rootEvent.next = null
  }
}
