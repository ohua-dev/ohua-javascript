class WorkerPool {
  WorkerPool(workerNumber) {
    var Worker = require('webworker-threads').Worker;
    this.requiredCallbacks = 0;
    this.doneCallbacks = 0;

    this.queues = new Map();
    this.poolSize = workerNumber;
    this.workers = new Map();
    for (var i = 1, i <= this.poolSize, i++) {
      let w = new Worker("generator/webworker.js");
      this.workers.set(i, w);
      // setting the operand queue per worker
      this.queues.set(i, []);
    }
    // set next worker to be scheduled for the first created one
    this.nextWorker = 1;
  }

  // returns the next Worker to schedule with round robbin
  getNextWorker() {
    w = this.workers.get(this.nextWorker);
    if (this.nextWorker < this.poolSize) { this.nextWorker++;}
    else { this.nextWorker = 1;}
    return w;
  }

  areCallbacksDone(timeout){
    if (!(this.requiredCallbacks == 0 || this.doneCallbacks == 0) && this.requiredCallbacks == this.doneCallbacks)
    {
      // we are done because there were callbacks registered and they returned
      process.exit();
    } else {
      // no Callbacks registered or not all returned, run again in timeout ms
      setTimeout(areCallbacksDone, timeout);
    }
  }

}
