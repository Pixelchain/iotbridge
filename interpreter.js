/**
 * Define the Interpreter class and the constructor
 */
var Interpreter = function() {
    this.configuration = {
        'name' : 'IOTInterpreter',
        'version' : '0.0.1',
        'tag' : 'beta',
        'title' : ''    
        };
                  
    this.prefix = '/';            
    this.bridge = null;        
    this.init();
                        
};

/**
 * Define de class method startsWith
 */
String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
}

/**
 * Define de class method endsWith
 */
String.prototype.endsWith = function(suffix) {
    return this.match(suffix+"$") == suffix;
};

function log(params) {
    console.log(params);
}

function err(params) {
    console.error(params);
}

/**
 * Assign a readline to the interpreter
 */
Interpreter.prototype.assignReadline = function(readline) {
    this.rl = readline;
}

/**
 * Serve on close event of readline e.g. when closing the console with ctrl+c
 */
Interpreter.prototype.onClose =  function() {    
    process.exit(0);
};

Interpreter.prototype.execute = function(line,valueHandler) {    
        if (line.trim() === '') return;
        
        var value = null;

        var ch = line.charAt(0);
        var args = line.split(' ');
        
        if (args.length === 0) {
            args.push(line);
        }
        
        //************************
        // Change Channel or Remap
        //************************
        //if (args[0].startsWith('/')) {
        //    var channel = args[0].substring(1);
        if (this.bridge.matchesChannel(args[0])) {
            var channel = args[0];        
            // change channel or map channel
            if (args.length === 2) {
                // map
                var port = args[1];                
                // change
                if (this.bridge) {
                    log('Mapping '+channel+' to '+port);
                    if (this.bridge.mapChannel(channel,port)) {                    
                        this.setPrompt(channel + '/');
                    }
                }
                
            } else
            if (args.length === 1) {
                // change       
                if (this.bridge) {
                    if (this.bridge.changeChannel(channel)) {
                        this.setPrompt(channel + '/');
                    }
                }
            };         
        }
        
        //************************
        // Send a text to the current channel
        //************************
        if (args[0].startsWith('>')) {
            if (this.bridge) {                
                this.bridge.sendText(args[0].substring(1));
            }            
        }        
        
        //************************
        // List channels
        //************************
        if (args[0].startsWith('ls')) {
            if (this.bridge) {             
                if (args.length === 1) {
                    log(this.bridge.list(''));
                } else {                   
                    log(this.bridge.list(args[1].trim()));
                }
            }
        }
                
        //************************
        // Open Channel
        //************************
        if (args[0].startsWith('o')) {
            if (this.bridge) {
                this.bridge.openCurrentChannel();                
            }            
        }        
        
        //************************
        // Close Channel
        //************************
        if (args[0].startsWith('c')) {
            if (this.bridge) {
                this.bridge.closeCurrentChannel();
            }            
        }        
        
        //************************
        // Help
        //************************
        if (args[0].startsWith('h')) {            
            console.log('List of commands : ');
            console.log(' channel port      - remap channel to a new port. For port use COM1 for Windows or /dev/tty-usbserial1 for Linux ');
            console.log(' channel           - change to port mapped to a specific channel');
            console.log(' >text             - sends the text to the current channel');
            console.log(' ls                - list the current channels');
            console.log(' o                 - open the port on the current channel');            
            console.log(' c                 - close the port on the current channel');            
            console.log(' exit              - close exit the process where the interpreter runs');
            console.log(' h                 - this screen');            
            console.log('Examples:');        
            console.log(' lora COM1         - map "lora" channel to COM1');
            console.log(' gps COM2          - map "gps" channel to COM2');
            console.log(' bt COM3           - map "bt" channel to COM3');
            console.log(' bt                - change to "gps" channel');
            console.log(' D                 - send D command to the bluetooth device');
        }    
        
        //************************
        // exit
        //************************
        if (args[0] === 'exit') {
            process.exit(0);
        }        

        if (valueHandler) {
            valueHandler(value);
        }            
}

/**
 * Serve on new line of readline e.g. when pressing enter after editing a line
 */
Interpreter.prototype.onNewLine = function(line) {
    // warning: here this is the rl, since this is an event from readline
    try {
        var self = this;
        this.interpreter.execute(line,function(value) {
            self.prompt();            
        });        
    }  catch (error) {
        err(error);
    }        
    };

/*

var serialPort = new SerialPort("COM1", {
  baudrate: 57600
});

serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
  });
  serialPort.write("ls\n", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});

console.log("hello world!");

*/

/**
 * Set the bridge to the interpreter class
 */
Interpreter.prototype.setBridge = function(bridge) {
    this.bridge = bridge;
    if (this.bridge) {
        this.bridge.handler = this.bridgeHandler;
        console.log("Bridging with "+this.bridge.configuration.title);
    }
};

/**
 * Handler that receives data from all channels
 */
Interpreter.prototype.bridgeHandler = function(bridge,channel,port,data) {
    log('\n'+channel+'/<'+data.toString('utf8'));
}

/**
 * Init the object instance
 */
Interpreter.prototype.init = function() {    
    this.configuration.title = this.configuration.name + ' v' +this.configuration.version+' '+this.configuration.tag;
    console.log(this.configuration.title);
};

/**
 * Set the interpreter prompt text
 */
Interpreter.prototype.setPrompt = function(text) {
    this.prefix = text;
    if (this.rl) {
        this.rl.setPrompt(this.prefix);
        this.rl.prompt();
    }
};

/**
 * Run the interpreter
 */
Interpreter.prototype.run = function() {
    // since we react on readline class events we need to assign the bridge to the readline instance
    if (this.rl) {
        this.rl.bridge = this.bridge;
        this.rl.interpreter = this;        
        // link the readline events
        this.rl.on('line',this.onNewLine).on('close', this.onClose);
    }
    this.setPrompt(this.prefix);    
};

/**
 * Export the interpreter object instance
 */
module.exports.Interpreter = new Interpreter();