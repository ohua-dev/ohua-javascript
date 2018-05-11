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
structure.set("imports", returns.imports);
structure.set("functions", returns.functions);
structure.set("operators", returns.operations);
structure.set("arcs", returns.arcs);

// console.log(`Structure: ${[...structure]}`);

print(structure);
// parsing


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
    operators.set(op.operatorId, `${op.operatorType.qbNamespace}.${op.operatorType.qbName}`);
  }
  return operators;
}

// returns all arcs found in the JSONconstruct
function extractArcs(JSONarcs)
{
  var arcs = new Map();

  var length = JSONarcs.length;
  for (var i=0; i < length; i++)
  {
    var arc = JSONarcs[i]
    arcs.set(i, arc)
  }
  return arcs
}

function parseGraph(ohua)
{
  // get imports and funtions
  var dependencies = extractDependencies(ohua.sfDependencies);
  // get operators
  var ops = extractOperators(ohua.graph.operators);
  // get operators
  var arcs = extractArcs(ohua.graph.arcs)

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

// just printing the parsed objects to stdout
// expect to get handed a map
function print(parsedObjects)
{
  parsedObjects.forEach(function(value, key, map)
  {
    console.log(`m[${key}] = [${[...value]}]`);
  })
}
