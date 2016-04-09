/**
 * Instanciate the global SerialPort class
 */
SerialPort = require("serialport").SerialPort;

/**
 * Define the Bridge class and constructor
 */
var Bridge = function() {
        
    this.configuration = {
    'name' : 'IOTBridge',
    'version' : '0.0.1',
    'tag' : 'beta',
    'title' : '',
    'channels' : {
        'lora' : 'COM1',
        'btle' : 'COM2',
        'gps'  : 'COM3'   
    },
    'ports' : {
        
        },
    'routes' : {
        //source : {destinations}
        'lora' : {
            },
        'gps' : {
                'coordinates' : ['lora','btle'],
                'timestamp'   : ['lora']
            },
        'btle' : {                
            }                        
        },
      'filters' : {
          'lora' : {
              
          },
          'btle' : {
              
          },
          'gps' : {
              'coordinates' : 'todo: regex',
              'timestamp' : 'todo: regex',
          },          
      }
    }    
   this.init();                  
};

/**
 * Log a message to the console
 */
function log(params) {
    console.log(params);
}

/**
 * Log an error to the console
 */
function err(params) {
    console.error(params);
}

/**
 * Gets the port instance of a specific channel.
 */
Bridge.prototype.getPortOfChannel = function(channel) {
    var portName = this.configuration.channels[channel];
    return this.configuration.ports[portName]; 
}

/**
 * Gets the minimal channel info in one line for display purposes
 */
Bridge.prototype.getChannelInfo = function(channel) {
    var port =  this.getPortOfChannel(channel);
    var info =  channel;
    //if (port) {
    //    info += "[" + port.path+"]";
    //}
    return info;
}

/**
 * (re)Map a channel to a specific port
 */
Bridge.prototype.mapChannel = function(name,port) {
    if (port === "") {
        delete this.configuration.channels[name];    
    } else {
        this.configuration.channels[name] = port;
    }
    console.log(this.configuration.channels);
    this.configure();        
}

/**
 * Lists various information about the bridhe
 */
Bridge.prototype.list = function(text) {
    
    log("List "+text);
    // where text
    // nothing  - list entire configuration
    // ports    - list ports
    // channels - list channels
    // routes   - list routes
    if (text === "") {
        return this.configuration;
    }
    if (text === "ports") {
        return this.configuration.ports;
    }
    if (text === "channels") {
        return this.configuration.channels;
    }    
    if (text === "routes") {
        return this.configuration.routes;
    }
    if (text === "filters") {
        return this.configuration.filters;
    }    
}

/**
 * (re)Configure the bridge
 */
Bridge.prototype.configure = function() {
    console.log('Reconfiguring channels, ports, routes');
    
    // close the ports
    for (var channel in this.configuration.channels) {
       var portName = this.configuration.channels[channel];
       var port = this.configuration.ports[portName];
       if (port) {
           if (port.isOpen() ){               
            log('Closing '+portName)
            port.close();
           }
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


/**
 * Change currentChannel to a new channel
 */
Bridge.prototype.changeChannel =  function(channel) {
    if (this.configuration.channels[channel]) {        
        this.configuration.currentChannel = channel;
        log('Switching to '+channel + '['+this.configuration.channels[channel]+']' );
        return true;
    } else {
        err(channelError(channel));
        return false;
    }
}

function channelError(channel) {
    return 'Channel '+channel+' not found. Use "/name port" command to define a new channel e.g. >/lora COM1';
}

/**
 * Open currentChannel
 */
Bridge.prototype.openCurrentChannel =  function() {
    var crtChannel = this.configuration.currentChannel;
    var self = this;   
    var port = this.getPortOfChannel(crtChannel);
    if (!port) {
        err(channelError(''));
        return;
    }
    if (port.isOpen()) {
       err(self.getChannelInfo(crtChannel) + ' is already open');
       return;        
    }    
    port.open(function(error) {
        if(error) {
            err(error);
        }        
    });
}

/**
 * Send text to currentChannel
 */
Bridge.prototype.sendText =  function(text) {
    err("ToDo: sendText "+text);
}

/**
 * Close currentChannel
 */
Bridge.prototype.closeCurrentChannel =  function() {
    var crtChannel = this.configuration.currentChannel;
    var self = this;   
    var port = this.getPortOfChannel(crtChannel);
    if (!port) {
        err(channelError(''));
        return;
    }    
    if (port.isOpen()) {
        port.close(function(error) {
            if (error) {
                err(error);
            }
        });
    } else {
            err(self.getChannelInfo(crtChannel) + ' is already closed');        
        }
}

/**
 * Init the bridge class instance
 */
Bridge.prototype.init = function() {
    this.configuration.title = this.configuration.name + ' v' +this.configuration.version+' '+this.configuration.tag;
    this.configure();
    //console.log(this.configuration.title); 
    //this.mapChannel('lora','COM1');
    //bridge.map('bt','');
}

/**
 * Export the Bridge class object instance
 */
module.exports.Bridge = new Bridge();