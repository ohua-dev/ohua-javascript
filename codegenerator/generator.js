var parser = require("./parser.js");
var printer = require("./printer.js");
var fs = require("fs");

function getDirFromPath(path)
{ // found here: https://stackoverflow.com/questions/16750524/remove-last-directory-in-url?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
  var arr = path.split('/');
  arr.pop();
  return( arr.join('/') );
}

// Starting of production logic
var args = process.argv.slice(2); // new array of calling options skipping "node" and "generator.js"
// append dir of graph because we expect the sFn's in the same dir
module.paths.push(getDirFromPath(args[0]));

// loading JSON
var rawJSON = fs.readFileSync(args[0]);
var graph = JSON.parse(rawJSON);

// TODO(br): fix parser
var returns = parser.parseGraph(graph);
structure = new Map();
structure.set("imports", returns.imports);
structure.set("functions", returns.functions);
structure.set("operators", returns.operations);

console.log(`Structure: ${[...structure]}`);

printer.print(structure);
// parsing
