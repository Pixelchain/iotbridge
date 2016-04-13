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
// change channel to bt
// immediatelly execute :bt command
//interpreter.execute(':lora0');
/*
interpreter.async(
    [        
        { 'c' : '; Set up Receiver', 'r' : '', 'd' : 50}, 
        { 'c' : ':lora0', 'r' : '', 'd' : 50},
        { 'c' : 'mac pause', 'r' : '', 'd' : 50},
        { 'c' : 'radio set wdt 0', 'r' : '', 'd' : 50},
        { 'c' : 'radio rx 0', 'r' : '', 'd' : 50},
        { 'c' : '; Set up Sender', 'r' : '', 'd' : 50},
        { 'c' : ':lora1', 'r' : '', 'd' : 50},
        { 'c' : 'mac pause', 'r' : '', 'd' : 50},
        { 'c' : 'radio set pwr 14', 'r' : '', 'd' : 50},
        { 'c' : 'radio tx 0123456789ABCDEF', 'r' : '', 'd' : 50}
    ]
    );
*/
/*
interpreter.async(
    [        
        'radio tx DEADBEEF',
        'radio tx CAFEBABE',
        'radio tx DEADBEEF',
        'radio tx CAFEBABE',
        'radio tx DEADBEEF',
        'radio tx CAFEBABE'                
    ],{
        timeout     : 50
    });
*/


// send H command after 100 msec
/*
interpreter.async('H',{
    timeout     : 100    
});
// send D command after 100 msec
interpreter.async('D',{
    timeout     : 100    
});
interpreter.execute(':mad');
interpreter.async('C DEAD System getBoardId ',{
    timeout : 200
});
*/
// open the port attached to lora channel
//interpreter.execute('o');

// run the commanline interpreter by waiting on the readline
interpreter.run();
