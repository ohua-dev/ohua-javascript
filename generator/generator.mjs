var fs = require("fs");  // should be working as of example: https://nodejs.org/api/esm.html#esm_notable_differences_between_import_and_require

function getDirFromPath(path)
{ // found here: https://stackoverflow.com/questions/16750524/remove-last-directory-in-url?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
  var arr = path.split('/');
  arr.pop();
  return( arr.join('/') );
}

// returns imports and functions
function extractDependencies(sfDependencies)
{
  var imports = new Set();
  var functions = new Array();

  var length = sfDependencies.length;
  for (var i=0; i< length; i++)
  {
    var sfn = sfDependencies[i];
    // this does not
    imports.add(`${sfn.qbNamespace}`);
    // this works again
    functions.push(`${sfn.qbNamespace}.${sfn.qbName}`);
  }

  return {
    imports: imports,
    functions: functions
  };
}

// returns all defined operatos with the function to call
function extractOperators(JSONops)
{
  var operators = new Map();

  var length = JSONops.length;
  for (var i=0; i < length; i++)
  {
    var op = JSONops[i];
    operators.set(op.operatorId, {namespace: op.operatorType.qbNamespace, function: op.operatorType.qbName});
  }
  return operators;
}

function parseGraph(ohua)
{
  // get imports and funtions
  var dependencies = extractDependencies(ohua.sfDependencies);
  // get operators
  var ops = extractOperators(ohua.graph.operators);
  // get operators
  var arcs = ohua.graph.arcs

  return {
    functions: dependencies.functions,
    imports: dependencies.imports,
    operations: ops,
    arcs: arcs
  };
}

function writeJS(parsedObjects, destination)
{
  // TODO(br): implement printing JS to <destination>
  var operators = parsedObjects["operators"];
  var arcs = parsedObjects["arcs"];
  operators.forEach(function(key, value, map)
  {
    var sourcecode = `self.addEventlistener("message", function(e)
    {
      var data = e.data;
      var result;
      // webworker only support importScripts()
      importScripts(${data.path}/${data.namespace})
      if(data.hasOwnProperty("parameter"))
      {
        result = ${func}(data.parameter);
      } else
      {
        result = ${func}();
      }
      self.postMessage(result);
      self.close();
    }, false)`
  });
}

// building the map of webworkers and the destination of their results
function buildWorkerMap(arcs, operators)
{
  //console.log("buildWorkerMap");

  var workers = new Map();
  var Worker = require('webworker-threads').Worker;
  operators.forEach(function(value, key, map)
  {
    let w = new Worker("generator/webworker.js");
    let id = key;
    let sourceTo = [];
    let length = arcs.length;
    // building list to push result to
    for (var i=0; i < length; i++)
    {
      if (arcs[i].source.val.operator == id)
      {
        sourceTo.push({target: arcs[i].target.operator, index: arcs[i].target.index})
      }
    }
    // saving worker with targets to push result to
    workers.set(key,  {worker: w, sourceTo: sourceTo, operator: value});
  });
  return workers;
}

// registers all messagepassing listeners
function registerMessageHandlers(workers, path)
{
  //console.log("registerMessageHandlers");

  workers.forEach(function(value, key, map)
  {
    let length = value.sourceTo.length
    // registering Listeners & pushing results to the next Operator
    if (length > 0)
    {
      value.worker.onmessage = function(e)
      {
        doneCallbacks++;

        let result = e.data
        console.log("Intermediate result: ", result);

        for (var i=0; i < length; i++)
        {
          // push to every worker waiting for the result
          workers.get(value.sourceTo[0].target).worker.postMessage(
            {
              // getting
              function: map.get(value.sourceTo[0].target).operator.function,
              namespace: map.get(value.sourceTo[0].target).operator.namespace[0],
              parameter: result,
              path: path,
            }
          );
          requiredCallbacks++;
        }
      }
    } else
    {
      value.worker.onmessage = function(e)
      {
        console.log('result: ', e.data);
        doneCallbacks++;
      }
    }
    // registering Error handler
    value.worker.onerror = function(e)
    {
      console.error("worker for operator ",value.operator.namespace[0] + "/" +  value.operator.function, " crashed.");
      doneCallbacks++;
    }
  })
}

// posts the input to the entry points to trigger calculation
function startCalculation(arcs, operators, path, workers, input)
{
  //console.log("start calculation");
  // find entrypoint
  var starts = [];
  var length = arcs.length;
  for (var i=0; i < length; i++)
  {
    if (arcs[i].source.type != "local")
    {
      starts.push(arcs[i].target);
    }
  }

  // pushing input to all starting points
  var length = starts.length;
  for (var i=0; i < length; i++)
  {
    let dest = starts[i].operator;
    workers.get(dest).worker.postMessage(
      {
        function: operators.get(dest).function,
        namespace: operators.get(dest).namespace[0],
        parameter: input,
        path: path,
      }
    );
    requiredCallbacks++;
  }
}

// executing the parsed details
function executeGraph(parsedObjects, path, input)
{
  //console.log("execute graph");
  var operators = parsedObjects["operators"];
  var arcs = parsedObjects["arcs"];
  var workers = buildWorkerMap(arcs, operators);
  registerMessageHandlers(workers, path);
  startCalculation(arcs, operators, path, workers, input);
}

// just printing the parsed objects to stdout
// expect to get handed a map
function print(parsedObjects)
{
  parsedObjects.forEach(function(value, key, map)
  {
    console.log(`m[${key}] = [${[...value]}]`);
  })
}

function extractPath(path)
{
  var res = path.split("/")
  // removing last entry
  res.pop()
  var unix = true;
  if (res.length < 2)
  {
    res = path.split("\\");
    unix = false;
  }
  if (unix) { return res.join("/"); }
  else { return res.join("\\"); }
}

function main()
{
  var args = process.argv.slice(2); // new array of calling options skipping "node" and "generator.mjs"

  // loading JSON
  var path = args[0]
  var rawJSON = fs.readFileSync(path);
  var graph = JSON.parse(rawJSON);
  var input = args.slice(start=1);

  var returns = parseGraph(graph);
  var structure = new Map();
  structure["imports"] = returns.imports;
  structure["functions"] = returns.functions;
  structure["operators"] = returns.operations;
  structure["arcs"] = returns.arcs;

  //console.log(structure);

  path = extractPath(path);
  // executing
  executeGraph(structure, path, input);
  areCallbacksDone();
}

function areCallbacksDone(){
  if (!(requiredCallbacks == 0 || doneCallbacks == 0) && requiredCallbacks == doneCallbacks)
  {
    // we are done because there were callbacks registered and they returned
    process.exit();
  } else {
    // no Callbacks registered or not all returned, run again in 100ms
    setTimeout(areCallbacksDone, 100);
  }
}

var requiredCallbacks = 0;
var doneCallbacks = 0;

main();
