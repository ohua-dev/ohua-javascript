exports.writeJS = function(imps, functs, ops, destination)
{
  // TODO(br): implement printing JS to <destination>
}

// just printing the parsed objects to stdout
// expect to get handed a map
exports.print = function(parsedObjects)
{
  parsedObjects.forEach(function(value, key, map)
  {
    var k = JSON.stringify(key)
    var v = JSON.stringify(value)
    console.log(`m[${k}] = ${v}`);
  })
}
