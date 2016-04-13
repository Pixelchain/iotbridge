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
                'encoding' : 'tcf',
                'separator' : '\u0000',
                'terminator': '\u0000\n'
                
            },
            'bt' : {
                'encoding' : 'text',
                'separator' : ' ',
                'terminator': "\n"
                
            },
            'lora' : {
                'encoding' : 'hex',
                'separator' : ' ',
                'terminator': "\r\n"
                
            }
        }
        };
                  
    this.prefix = '>';            
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

Interpreter.prototype.async = function(lines,params) {
    var timer = 0;
    if (lines.constructor === Array) {
        var c = '';
        var r = ''
        var d = 0;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if(line.hasOwnProperty('c')){
                c = line.c;
            }
            if(line.hasOwnProperty('r')){
                r = line.r;
            }
            if(line.hasOwnProperty('d')){
                d = line.d;
            }
            timer+=d;
            line.timerHandle = setTimeout(this.execute,timer,line,null,this,true);            
        }
   }    
}

Interpreter.prototype.execute = function(line,valueHandler,instance,echo) {
    
    if (instance) {
        self = instance
    } else {
        self = this;
    }

    var command = line.c;
    var response = line.r;
            
    if (command.trim() === '') {
        if (self.configuration.lastCommand) {
            command = self.configuration.lastCommand;
        }
    }   
            
    if (echo) {
        log(command);
    }
    
    if (command.charAt(0) === ';') {
        return;
    }
                
    var value = null;

    var ch = command.charAt(0);
    var args = command.split(' ');
    
    if (args.length === 0) {
        args.push(command);
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
                    self.setPrompt(channel + '>');
                }
            }
            
        } else
        if (args.length === 1) {
            // change       
            if (self.bridge) {
                if (self.bridge.changeChannel(channel)) {
                    self.setPrompt(channel + '>');
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
    
    self.sendDeviceCommand(command,response);          
    

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

Interpreter.prototype.getProtocol = function(channel) {
    for (var key in this.configuration.protocols) {
        if (channel.startsWith(key)) {
            return this.configuration.protocols[key];
        }
    }
}

Interpreter.prototype.sendDeviceCommand = function(line,response) {        
    if (this.bridge) {
        if (this.bridge.configuration.currentChannel) {
            var protocol = this.getProtocol(this.bridge.configuration.currentChannel);
            if (protocol) {
                var separator = protocol.separator; 
                var terminator = protocol.terminator;
                line = line.replace(/ /g , separator);
                line = line + terminator;                
            } else {
                line = line + '\n';
            }         
            //console.log(toHex(line));
            this.bridge.sendText(line,response);            
        }
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
        this.bridge.dataHandler = this.bridgeDataHandler;
        this.bridge.interpreter = this;
        console.log("Bridging with "+this.bridge.configuration.title);
    }
};

/**
 * dataHandler that receives data from all channels
 */
Interpreter.prototype.bridgeDataHandler = function(port,data) {    
    port.bridge.interpreter.write('\r\n'+port.channel+"<"+data.toString('utf8'));    
}

/**
 * 
 */
Interpreter.prototype.write = function(text) {
    //this.rl.setPrompt(this.prefix+text);
    //this.rl.prompt();
    //console.log(text);
    //this.rl.clearLine(process.stdout,0);
    //this.rl.clearLine(process.stdout);
    process.stdout.write(text);
    this.rl.setPrompt(this.prefix);
    this.rl.prompt();    
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