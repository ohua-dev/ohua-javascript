function world(arg)
{
  // crashes the webworker-thread when called with a Number but not when called with an object
  //console.info("Input: ", arg);
  return (arg + 2);
}

function calc(arg)
{
  // crashes the webworker-thread
  //console.log("Input: ", arg);
  return (arg * 2) ;
}
