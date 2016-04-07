var Interpreter = function() {
    this.configuration = {
        'name' : 'IOTInterpreter',
        'version' : '0.0.1',
        'tag' : 'beta',
        'title' : ''    
        };
            
    // ReadLine class  
    this.prefix = '>';        
    this.rl = require('readline').createInterface(process.stdin, process.stdout);    
    this.bridge = null;        
    this.init();
                        
};

String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
}

String.prototype.endsWith = function(suffix) {
    return this.match(suffix+"$") == suffix;
};

function log(params) {
    console.log(params);
}

function err(params) {
    console.error(params);
}

Interpreter.prototype.onClose =  function() {    
    process.exit(0);
};

Interpreter.prototype.onNewLine = function(line) {
    
        if (line.trim() === '') return;

        var ch = line.charAt(0);
        var args = line.split(' ');
        
        if (args.length === 0) {
            args.push(line);
        }
        
        //************************
        // Change Channel or Remap
        //************************
        if (args[0].startsWith('/')) {
            var channel = args[0].substring(1);
            // change channel or map channel
            if (args.length === 2) {
                // map
                var port = args[1];                
                // change
                if (this.bridge) {
                    log('Mapping '+channel+' to '+port);
                    if (this.bridge.mapChannel(channel,port)) {                    
                        this.setPrompt(channel + '>');
                    }
                }
                
            } else
            if (args.length === 1) {
                // change       
                if (this.bridge) {
                    if (this.bridge.changeChannel(channel)) {
                        this.setPrompt(channel + '>');
                    }
                }
            };         
        }       

        //************************
        // Open Channel
        //************************
        if (args[0].startsWith(':o')) {
            if (this.bridge) {
                log('TODO: this.bridge.openChannel();');
            }            
        }
        
        //************************
        // Close Channel
        //************************
        if (args[0].startsWith(':c')) {
            if (this.bridge) {
                log('TODO: this.bridge.closeChannel();');
            }            
        }        
        
        //************************
        // Help
        //************************
        if (args[0].startsWith(':h')) {            
            console.log('List of commands : ');
            console.log(' /lora port        - remap "lora" channel to a new "port". Use COM1 for Windows or /dev/tty-usbserial1 for Linux ');
            console.log(' /lora             - change to port mapped to the channel "lora"');
            console.log(' :o                - open the port on the current channel');            
            console.log(' :c                - close the port on the current channel');            
            console.log(' :h                - this screen');            
            console.log('Examples:');        
            console.log(' /lora COM1        - map "lora" channel to COM1');
            console.log(' /gps COM2         - map "gps" channel to COM2');
            console.log(' /bt COM3          - map "bt" channel to COM3');
            console.log(' /bt               - change to "gps" channel');
            console.log(' D                 - send D command to the bluetooth device');
        }    

        this.prompt();
        
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

Interpreter.prototype.setBridge = function(bridge) {
    this.bridge = bridge;
    console.log("Bridging with "+this.bridge.configuration.title);
};

Interpreter.prototype.init = function() {    
    this.configuration.title = this.configuration.name + ' v' +this.configuration.version+' '+this.configuration.tag;
    console.log(this.configuration.title);
};

Interpreter.prototype.setPrompt = function(prompt) {
    this.prefix = prompt;
    this.rl.setPrompt(this.prefix);
    this.rl.prompt();
};

Interpreter.prototype.run = function() {
    // since we react on readline class events we need to assign the bridge to the readline instance
    this.rl.bridge = this.bridge;
    
    // link the readline events
    this.rl.on('line',this.onNewLine).on('close', this.onClose);
    this.setPrompt(this.prefix);    
};

Interpreter.prototype.prompt = function() {    
    this.prompt();    
};

module.exports.Interpreter = new Interpreter();