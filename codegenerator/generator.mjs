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
  console.log("buildWorkerMap");

  var workers = new Map();
  var Worker = require('webworker-threads').Worker;
  operators.forEach(function(value, key, map)
  {
    let w = new Worker("codegenerator/webworker.js");
    let id = key;
    let sourceTo = [];
    let length = arcs.length;
    // building list to push result to
    for (var i=0; i < length; i++)
    {
      if (arcs[i].source.val == id)
      {
        sourceTo.push({target: arcs[i].target.operator, index: arcs[i].target.index})
      }
    }
    // saving worker with targets to push result to
    workers[key] = {worker: w, sourceTo: sourceTo};
  });
  return workers;
}

// registers all messagepassing listeners
function registerEventlisteners(workers)
{
  console.log("registerEventlisteners");

  workers.forEach(function(value, key, map)
  {
    let length = value.sourceTo.length
    // registering Listeners & pushing results to the next Operator
    if (length > 0)
    {
      value.worker.addEventListener('message', function(e)
      {
        console.log('intermediate result: ', e.data);

        for (var i=0; i < length; i++)
        {
          // push to every worker waiting for the result
          workers[value.sourceTo.target].worker.postMessage({parameter: e.data});
        }
      })
    } else
    {
      value.worker.addEventListener('message', function(e)
      {
        console.log('result: ', e.data);
      })
    }
  })
}

// posts the input to the entry points to trigger calculation
function startCalculation(arcs, workers, input)
{
  console.log("start calculation");
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
    workers[dest].worker.postMessage({parameter: input});
  }
}

// executing the parsed details
function executeGraph(parsedObjects, input)
{
  console.log("execute graph");
  var operators = parsedObjects["operators"];
  var arcs = parsedObjects["arcs"];
  var workers = buildWorkerMap(arcs, operators);
  registerEventlisteners(workers);
  startCalculation(arcs, workers, input);

  //TODO(br): find out if all operators ran
}

// just printing the parsed objects to stdout
// expect to get handed a map
function print(parsedObjects)
{
  console.log("BAM")
  parsedObjects.forEach(function(value, key, map)
  {
    console.log(`m[${key}] = [${[...value]}]`);
  })
}

function main()
{
  var args = process.argv.slice(2); // new array of calling options skipping "node" and "generator.mjs"

  // loading JSON
  var rawJSON = fs.readFileSync(args[0]);
  var graph = JSON.parse(rawJSON);
  var input = args[1];

  var returns = parseGraph(graph);
  var structure = new Map();
  structure["imports"] = returns.imports;
  structure["functions"] = returns.functions;
  structure["operators"] = returns.operations;
  structure["arcs"] = returns.arcs;

  //print(structure);
  //console.log(structure);

  // executing
  executeGraph(structure, input);
}

main();
