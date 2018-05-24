self.addEventlistener("message", function(e)
{
  var data = e.data;
  var func = data.function
  var result;
  // dynamic import: https://developers.google.com/web/updates/2017/11/dynamic-import
  const moduleSpecifier = `${data.path}/${data.namespace}`;
  const module = await import(moduleSpecifier)
  if(data.hasOwnProperty("parameter"))
  {
    result = module.func(data.parameter);
  } else
  {
    result = module.func();
  }
  self.postMessage(result);
}, false)
