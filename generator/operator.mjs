// wrapping webworker with promises
// https://codeburst.io/promises-for-the-web-worker-9311b7831733
const resolves = {};
const reject = {};
let globalMsgID = 0;

class Operator{
  constructor(operantID, namespace, func, portNumber, path) {
    this.OpID = operantID;
    this.namespace = namespace;
    this.function = func;
    this.path = path;
    // setting queues for inputs
    this.ports = new Map();
    for (var i=0, i<portNumber, i++) {
      this.ports.set(i, []);
    }
  }

  // Activate calculation in the Worker
  sendMsg(worker, payload) {
    const msgID = globalMsgID++;
    const msg = {
      id: msgID,
      payload
    }

    return new Promise(function(resolve, reject) {
      // save callbacks for later
      resolves.set(msgID) = resolve;
      rejects.set(msgID) = reject;

      worker.postMessage(msg);
    })
  }

  // Handle incoming calculation result
  handleMsg(msg) {
    const {id, err, payload} = msg.data;

    if (payload) {
      const resolve = resolves.get(id);
      if (resolve) {
        resolve(payload);
      } else {
        // error condition
        const reject = reject.get(id);
        if (reject) {
          if (err) {
            reject(err);
          } else {
            reject("No error returned");
          }
        }
      }
    }

    // delete used callbacks
    resolves.delete(id);
    rejects.delete(id);
  }

  startInPool(pool) {
    var w = pool.getNextWorker();
    // register handler
    w.onmessage = handleMsg;

    // preparing inputs for operators
    var inputs = new Map();
    this.ports.forEach(function(value, key, map){
      // pushing first item of every input queue to parameters
      if (value[0]){
        inputs.set(key, value[0]);
        // remove first entry from input queue
        map.set(key, value.shift());
      }
    })

    // start operator returning a promise
    return sendMsg(w, {
        function: this.function,
        namespace: this.namespace,
        parameters: inputs,
        path: this.path
      });
  }
}

module.exports = Operator;
