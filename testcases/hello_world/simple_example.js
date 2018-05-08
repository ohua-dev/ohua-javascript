/*ns some_ns; TODO*/

var hello = require("./hello.js");

var res = hello.calc(process.argv[2]);  // process contains the call to this script
hello.world(res);                       // process.argv[0] = "node", process.argv[1] = "simple.example.js"
