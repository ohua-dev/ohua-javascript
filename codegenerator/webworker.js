self.addEventlistener("message", function(e)
{
  var data = e.data;
  var func = data.function
  var result;
  // dynamic import: https://developers.google.com/web/updates/2017/11/dynamic-import
  // webworker only support importScripts()
  moduleSpecifier = `${data.path}/${data.namespace}`;
  console.log("calling:", moduleSpecifier)
  importScripts(moduleSpecifier)
  if(data.hasOwnProperty("parameter"))
  {
    result = func(data.parameter);
  } else
  {
    result = func();
  }
  self.postMessage(result);
  self.close();
}, false)
