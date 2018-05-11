hello = (function()
{
  function calc(arg)
  {
    console.info(`Input: ${arg}`);
    return (arg * 2);
  }

  export function world(arg)
  {
      console.info(`Intermediate: ${arg}`);
      return (arg * 2);
  }

  return
  {
    calc: calc,
    world: world
  }
})()
