function doCalculation(e, cb)
{
  let result = null;
  let err = null;

  var data = e.data;
  var func = data.function;
  console.log("running worker for function: ", func);
  var result;
  moduleSpecifier = `${data.path}/${data.namespace}.js`;
  // webworker only support importScripts()
  importScripts(moduleSpecifier);
  if(data.hasOwnProperty("parameter"))
  {
    // apply calls a function
    result = global[func](data.parameter);
  } else
  {
    result = global[func]();
  }

  //return result;
  cb(err,result);
}

// Handle incoming messages
self.onmessage = function(msg) {
  const {id, payload} = msg.data

  doCalculation(payload, function(err, result) {
    const msg = {
      id,
      err,
      payload: result
    }
    self.postMessage(msg)
  })
}
