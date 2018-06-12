class Operator{
  Operator(operantID, namespace, func, portNumber, destinations=[]) {
    this.OpID = operantID;
    this.namespace = namespace;
    this.function = func;
    this.destinatons = destinations;
    // setting queues for inputs
    this.ports = new Map();
    for (var i=0, i<portNumber, i++) {
      this.ports.set(i, []);
    }
  }

  startInPool(pool, operators, path) {
    var w = pool.getNextWorker();
    // register handler
    w.onmessage = function(e) {
      let result = e.data;
      console.log("Intermediate result: ", result);
      let length = this.destinatons.length;
      if (length > 0) {
        for (var i=0; i < length; i++) {
          //TODO(br): change this to varaibles present here
          pool.getNextWorker().postMessage({
            function: map.get(value.sourceTo[0].target).operator.function,
            namespace: map.get(value.sourceTo[0].target).operator.namespace[0],
            parameter: result,
            path: path,
          })
        }
      }
    }

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

    // start operator
    w.postMessage(
      {
        function: this.function,
        namespace: this.namespace,
        parameters: inputs,
        path: path,
      }
    );
  }
}
