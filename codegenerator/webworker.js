this.onmessage = function(e)
{
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
  self.postMessage(result);
  self.close();
}
