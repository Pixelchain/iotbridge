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

interpreter.async(
    [        
        '; Set up Receiver',
        ':lora0',
//        'sys get ver',
        'mac pause',
/*      'radio get mod',
        'radio get freq',
        'radio get sf',
        'radio get bw',
        'radio get cr',
        'radio get prlen',
        'radio get pwr',
*/        
        'radio set wdt 0',
        'radio rx 0',
        '; Set up Sender',
        ':lora1',        
//        'sys get ver',
        'mac pause',
/*      'radio get mod',
        'radio get freq',
        'radio get sf',
        'radio get bw',
        'radio get cr',
        'radio get prlen',
        'radio get pwr',
*/        
        'radio set pwr 14',
        'radio tx 0123456789ABCDEF'
    ],{
        timeout     : 50
    });

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
