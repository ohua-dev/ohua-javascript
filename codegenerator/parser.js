// returns imports and functions
exports.extractDependencies = function(sfDependencies)
{
  var imports = new Map();
  var functions = [];

  var str = JSON.stringify(sfDependencies)
  console.info(`extractDependencies got: ${str}`);

  // the way I do this is considered bad pactice because we could have undefined entries which we would skip
  // but this is intended in this case, we actually only want defined array entries
  for (var index in sfDependencies)
  {
    var sfn = sfDependencies[index]
    imports.set(sfDependencies[index].qbNamespace, true);
    functions.push(`${sfn.qbName}`);
  }
  return imports, functions;
}

// returns all defined operatos with the function to call
exports.extractOperators = function(JSONops)
{
  var str = JSON.stringify(JSONops)
  console.info(`extractOperators got: ${str}`);
  var operators = new Map();
  // the way I do this is considered bad pactice because we could have undefined entries which we would skip
  // but this is intended in this case, we actually only want defined array entries
  for (var op in JSONops)
  {
    operatos.set(op.operatorId, `${op.operatorType.qbNamespace}.${op.operatorType.qbName}`);
  }
  return operators;
}

exports.parseGraph = function(ohua)
{
  var str = JSON.stringify(ohua)
  console.info(`parseGraph got: ${str}`);
  // get imports and funtions
  var imps, fncts = module.exports.extractDependencies(ohua.sfDependencies);

  // get operators
  var ops = module.exports.extractOperators(ohua.operators);

  return imps, fncts, ops;
}
