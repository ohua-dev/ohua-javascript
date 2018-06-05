this.onmessage = function(e)
{
  var data = e.data;
  var func = data.function
  console.log("running worker for function: ", func)
  var result;
  // dynamic import: https://developers.google.com/web/updates/2017/11/dynamic-import
  // webworker only support importScripts()
  moduleSpecifier = `${data.path}/${data.namespace}.js`;
  console.log("calling:", moduleSpecifier)
  importScripts(moduleSpecifier)
  if(data.hasOwnProperty("parameter"))
  {
    // apply calls a function
    result = func.apply(null, data.parameter);
  } else
  {
    result = func.apply(null);
  }
  self.postMessage(result);
  self.close();
}
