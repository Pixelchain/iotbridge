// Create a readline instance
var readline = require('readline').createInterface(process.stdin, process.stdout);

// Create the iot bridge object
var bridge = require('./bridge').Bridge;

// Create the interpreter object
var interpreter = require('./interpreter').Interpreter;

// assign the bridge to the interpreter
interpreter.setBridge(bridge);

// assign a readline to the interpreter
interpreter.assignReadline(readline);

// run the commanline interpreter
interpreter.run();

