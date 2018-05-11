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
    console.log(`m[${key}] = [${[...value]}]`);
  })
}
