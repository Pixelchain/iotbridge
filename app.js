
var bridge = require('./bridge').Bridge;
var interpreter = require('./interpreter').Interpreter;

interpreter.setBridge(bridge);
interpreter.run();

