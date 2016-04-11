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

// some default comands
// change channel to lora
interpreter.execute(':mad');
interpreter.script('C DEAD System getBoardId ',{
    timeout : 200
});
// open the port attached to lora channel
//interpreter.execute('o');

// run the commanline interpreter by waiting on the readline
interpreter.run();
