String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
}

String.prototype.endsWith = function(suffix) {
    return this.match(suffix+"$") == suffix;
};

// SerialPort class
SerialPort = require("serialport").SerialPort;

// ReadLine class
var ReadLine = require('readline'),
    rl = ReadLine.createInterface(process.stdin, process.stdout),
    prefix = '> ';

// on Every line
rl.on('line', function(line) {
    if (line.trim() === '') return;

    // /lora
    var ch = line.charAt(0);
    var args = line.split(' ');
    
    if (args.length === 0) {
        args.push(line);
    }
    
    console.log(args[0]);
    
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
            if (app.mapChannel(channel,port)) {
                prefix = channel + '>';
                rl.setPrompt(prefix, prefix.length);
            }
            
        } else
        if (args.length === 1) {
            // change
            if (app.changeChannel(channel)) {
                prefix = channel + '>';
                rl.setPrompt(prefix, prefix.length);
            }            
        };         
    }       
    
    //************************
    // Help
    //************************
    if (args[0].startsWith(':h')) {
        console.log('List of commands : ');
        console.log(' /lora port        - remap "lora" channel to a new "port". Use COM1 for Windows or /dev/tty-usbserial1 for Linux ');
        console.log(' /lora             - change to port mapped to the channel "lora"');
        console.log('Examples:');        
        console.log(' /lora COM1        - map "lora" channel to COM1');
        console.log(' /gps COM2         - map "gps" channel to COM2');
        console.log(' /bt COM3          - map "bt" channel to COM3');
        console.log(' /bt               - change to "gps" channel');
        console.log(' D                 - send D command to the bluetooth device');
    }    

    //switch (ch) {
        // change channel
        //case '/':
        //    var channel = line.substring(1);
        //    if (app.changeChannel(channel)) {
        //        prefix = channel + '>';
        //       rl.setPrompt(prefix, prefix.length);
        //    }
        //    break;
        //default:
        //    // default command sent to the current device
        //    break;
    //}

    rl.setPrompt(prefix, prefix.length);
    rl.prompt();

    // on Close
}).on('close', function() {
    console.log('Have a great day!');
    process.exit(0);
});

// app setup
var configuration = require('./app');
var app = configuration.app;
app.init();

// Give the command prompt
rl.setPrompt(prefix, prefix.length);
rl.prompt();


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