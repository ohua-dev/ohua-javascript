import fs from "fs";  // sould be working as of example: https://nodejs.org/api/esm.html#esm_notable_differences_between_import_and_require

function getDirFromPath(path)
{ // found here: https://stackoverflow.com/questions/16750524/remove-last-directory-in-url?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
  var arr = path.split('/');
  arr.pop();
  return( arr.join('/') );
}

// Starting of production logic
var args = process.argv.slice(2); // new array of calling options skipping "node" and "generator.js"
// append dir of graph because we expect the sFn's in the same dir
// module.paths.push(getDirFromPath(args[0]));

// loading JSON
var rawJSON = fs.readFileSync(args[0]);
var graph = JSON.parse(rawJSON);

var returns = parseGraph(graph);
var structure = new Map();
structure["imports"] = returns.imports;
structure["functions"] = returns.functions;
structure["operators"] = returns.operations;
structure["arcs"] = returns.arcs;

print(structure);

// executing
executeGraph(structure);

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
}

// executing the parsed details
function executeGraph(parsedObjects)
{
  let operators = parsedObjects["operators"];
  let arcs = parsedObjects["arcs"];
  let workers = new Map();
  operators.forEach(function(key, value, map)
  {
    let w = new Worker("webworker.js");
    let id = key;
    let length = arcs.length;
    let sourceTo = [];
    for (var i=0; i < length; i++)
    {
      if (arcs[i].source.val == id)
      {
        sourceTo.push({target: arcs[i].target.operator, index: arcs[i].target.index})
      }
    }
    workers[key] = {worker: w, sourceTo: sourceTo};
  });

  workers.forEach(function(key, value, map)
  {
    let length = value.sourceTo.length
    // registering Listeners & pushing results to the next Operator
    if (length > 0)
    {
      value.worker.addEventListener('message', function(e)
      {
        console.log('intermediate result: ', e.data);

        for (var i = 0; i < length; i++)
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

// just printing the parsed objects to stdout
// expect to get handed a map
function print(parsedObjects)
{
  parsedObjects.forEach(function(value, key, map)
  {
    console.log(`m[${key}] = [${[...value]}]`);
  })
}
