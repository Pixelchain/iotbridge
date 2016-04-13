// Create the iot bridge object
var bridge = require('./bridge').Bridge;

// Create the interpreter object
var interpreter = require('./interpreter').Interpreter;

// assign the bridge to the interpreter
interpreter.setBridge(bridge);

interpreter.async(
    [        
        { 'c' : ':mad COM39', 'r' : '', 'd' : 50},
        { 'c' : 'E Locator Hello ["Locator"]', 'r' : '', 'd' : 50}
    ]
    );
