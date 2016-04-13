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

interpreter.async(    
    [
    { 'c' : ':m mad0 COM39', 'd' : 500},        
    { 'c' : ':mad0', 'd' : 250},
    { 'c' : 'E Locator Hello ["Locator"]','d':150},
    { 'c' : 'C 1 System getBoardId','d':150},
    { 'c' : 'C 2 System getSn','d':150}        
    ]
);

// run the commanline interpreter by waiting on the readline
interpreter.run();
