/**
 * Define the Interpreter class and the constructor
 */
var Interpreter = function() {
    this.configuration = {
        'name' : 'IOTInterpreter',
        'version' : '0.0.1',
        'tag' : 'beta',
        'title' : '',
        'protocols' : {
            'mad' : {
                'separator' : '\u0000',
                'terminator': '\u0000\n'
                
            },
            'bt' : {
                'separator' : ' ',
                'terminator': "\n"
                
            }
        }
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

Interpreter.prototype.script = function(line,params) {
    if (params) {
        if ('interval' in params) {
            var time = params.interval;            
            setInterval(this.execute,time,line,null,this);
        }
        if ('timeout' in params) {
            var time = params.timeout;            
            setTimeout(this.execute,time,line,null,this);
        }
        
    }
}

Interpreter.prototype.execute = function(line,valueHandler,instance) {
    
    if (instance) {
        self = instance
    } else {
        self = this;
    }
        
    if (line.trim() === '') {
        if (self.configuration.lastCommand) {
            line = self.configuration.lastCommand;
        }
    }
            
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
    if (self.bridge.matchesChannel(args[0])) {
        var channel = args[0].substring(1);        
        // change channel or map channel
        if (args.length === 2) {
            // map
            var port = args[1];                
            // change
            if (self.bridge) {
                log('Mapping '+channel+' to '+port);
                if (self.bridge.mapChannel(channel,port)) {                    
                    self.setPrompt(channel + '/');
                }
            }
            
        } else
        if (args.length === 1) {
            // change       
            if (self.bridge) {
                if (self.bridge.changeChannel(channel)) {
                    self.setPrompt(channel + '/');
                }
            }
        };
        return;         
    }
    
    //************************
    // List channels
    //************************
    if (args[0].startsWith(':ls')) {
        if (self.bridge) {             
            if (args.length === 1) {
                log(self.bridge.list(''));
            } else {                   
                log(self.bridge.list(args[1].trim()));
            }
        }
        return;
    }
            
    //************************
    // Open Channel
    //************************
    if (args[0].startsWith(':o')) {
        if (self.bridge) {
            self.bridge.openCurrentChannel();                
        }
        return;
    }        
    
    //************************
    // Close Channel
    //************************
    if (args[0].startsWith(':c')) {
        if (self.bridge) {
            self.bridge.closeCurrentChannel();
        }
        return;     
    }        
    
    //************************
    // Help
    //************************
    if (args[0].startsWith(':h')) {            
        console.log('List of commands : ');
        console.log(' :channel port      - remap channel to a new port. For port use COM1 for Windows or /dev/tty-usbserial1 for Linux');
        console.log(' :channel           - change to port mapped to a specific channel');
        console.log(' :ls                - list the current channels');
        console.log(' :o                 - open the port on the current channel');
        console.log(' :c                 - close the port on the current channel');
        console.log(' :x                 - close exit the process where the interpreter runs');
        console.log(' :h                 - this screen');
        console.log(' text               - sends the text to the current channel');            
        console.log('Examples:');        
        console.log(' :lora COM1         - map "lora" channel to COM1');
        console.log(' :gps COM2          - map "gps" channel to COM2');
        console.log(' :bt COM3           - map "bt" channel to COM3');
        console.log(' :bt                - change to "gps" channel');
        console.log(' D                  - send D command to the bluetooth device');
        return;
    }    
    
    //************************
    // exit
    //************************
    if (args[0] === ':x') {
        process.exit(0);
    }
    
    /**
     * Send a command to the selected channel
     */
    
    self.sendDeviceCommand(line);          
    

    if (valueHandler) {
        valueHandler(value);
    }            
}

function toHex(str) {
	var hex = '';
	for(var i=0;i<str.length;i++) {
		hex += '-'+str.charCodeAt(i).toString(16);
	}
	return hex;
}

Interpreter.prototype.sendDeviceCommand = function(line) {        
    if (this.bridge) {
        var separator = this.configuration.protocols[this.bridge.configuration.currentChannel].separator; 
        var terminator = this.configuration.protocols[this.bridge.configuration.currentChannel].terminator;
        line = line.replace(/ /g , separator);
        //console.log(toHex(line));
        this.bridge.sendText(line+terminator);
    }
}

/**
 * Serve on new line of readline e.g. when pressing enter after editing a line
 */
Interpreter.prototype.onNewLine = function(line) {
    // warning: here this is the rl, since this is an event from readline
    try {
        var self = this;
        var interpreter = this.interpreter; 
        interpreter.execute(line,function(value) {
            self.prompt();
            interpreter.configuration.lastCommand = line;            
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