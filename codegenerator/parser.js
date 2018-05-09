// returns imports and functions
exports.extractDependencies = function(sfDependencies)
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

  console.log(`Imports: [${[...imports]}]     Functions: [${functions}]`);
  //TODO: find out why these returns do not work well
  return imports, functions;
}

// returns all defined operatos with the function to call
exports.extractOperators = function(JSONops)
{
  var operators = new Map();

  var length = JSONops.length;
  for (var i=0; i< length; i++)
  {
    var op = JSONops[i];
    operators.set(op.operatorId, `${op.operatorType.qbNamespace}.${op.operatorType.qbName}`);
  }
  console.log(`Operators: [${[...operators]}]`);
  return operators;
}

exports.parseGraph = function(ohua)
{
  // get imports and funtions
  var imps, fncts = module.exports.extractDependencies(ohua.sfDependencies);
  // get operators
  var ops = module.exports.extractOperators(ohua.graph.operators);

  //console.log(`${imps.length}`);
  return imps, fncts, ops;
}
