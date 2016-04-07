// Global SerialPort class
SerialPort = require("serialport").SerialPort;

var Bridge = function() {
    
    this.configuration = {
    'name' : 'IOTBridge',
    'version' : '0.0.1',
    'tag' : 'beta',
    'title' : '',
    'channels' : {
        'lora' : 'COM5'
        //'gps'  : 'COM3'   
    },
    'ports' : {
        
        }
    }
    
   this.init();                  
};

function log(params) {
    console.log(params);
}

function err(params) {
    console.error(params);
}

Bridge.prototype.mapChannel = function(name,port) {
    if (port === "") {
        delete this.configuration.channels[name];    
    } else {
        this.configuration.channels[name] = port;
    }
    console.log(this.configuration.channels);
    this.configure();        
}

Bridge.prototype.configure = function() {
    console.log('Reconfiguring channels');
    
    // close the ports
    for (var channel in this.configuration.channels) {
       var portName = this.configuration.channels[channel];
       console.log('Closing '+portName);
       if (this.configuration.ports[portName]) {
        this.configuration.ports[portName].close();
       } 
    }
    
    // delete the mapped serial ports
    this.configuration.ports = {};
    
    for (var channel in this.configuration.channels) {
               
       var portName = this.configuration.channels[channel];
       console.log('Mapping '+ channel+' to ' +portName);
         
        //https://www.npmjs.com/package/serialport
        //baudRate Baud Rate, defaults to 9600. Should be one of: 115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200, 150, 134, 110, 75, or 50. Custom rates as allowed by hardware is supported.
        //dataBits Data Bits, defaults to 8. Must be one of: 8, 7, 6, or 5.
        //stopBits Stop Bits, defaults to 1. Must be one of: 1 or 2.
        //parity Parity, defaults to 'none'. Must be one of: 'none', 'even', 'mark', 'odd', 'space'
        //rtscts
        //xon
        //xoff
        //xany
        //flowControl
        //bufferSize Size of read buffer, defaults to 255. Must be an integer value.
        //parser The parser engine to use with read data, defaults to rawPacket strategy which just emits the raw buffer as a "data" event. Can be any function that accepts EventEmitter as first parameter and the raw buffer as the second parameter.
        //encoding
        //dataCallback
        //disconnectedCallback
        //platformOptions - sets platform specific options, see below.
        try {                    
            this.configuration.ports[portName] = new SerialPort(
                //"/dev/tty-usbserial1", {
                    portName, {
                    baudrate: 115200,
                    dataBits : 8,
                    stopBits : 1,
                    parity : 'none'
                }, false);
        } catch (ex) {
            err(ex);
        }
       
       //console.log(this.configuration.ports[this.configuration.channels[channel]]); 
    }
}


Bridge.prototype.changeChannel =  function(channel) {
    if (this.configuration.channels[channel]) {        
        this.configuration.currentChannel = channel;
        log('Switching to '+channel + '['+this.configuration.channels[channel]+']' );
        return true;
    } else {
        err('Channel '+channel+' not found. Use "/name port" command to define a new channel e.g. >/lora COM1');
        return false;
    }
}

// Build the title
Bridge.prototype.init = function() {
    this.configuration.title = this.configuration.name + ' v' +this.configuration.version+' '+this.configuration.tag;
    //console.log(this.configuration.title); 
    //this.mapChannel('lora','COM1');
    //bridge.map('bt','');
}

module.exports.Bridge = new Bridge();