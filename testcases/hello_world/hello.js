exports.calc = function (arg) {
    console.info(`Input: ${arg}`);
    return (arg * 2);
}

exports.world = function(arg) {
    console.info(`Intermediate: ${arg}`);
    return (arg * 2);
}
