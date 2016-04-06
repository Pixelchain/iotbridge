var app = {
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
};

function log(params) {
    console.log(params);
}

function err(params) {
    console.error(params);
}

app.mapChannel = function(name,port) {
    if (port === "") {
        delete app.channels[name];    
    } else {
        app.channels[name] = port;
    }
    console.log(app.channels);
    app.configure();        
}

app.configure = function() {
    console.log('Reconfiguring channels');
    
    // close the ports
    for (var channel in app.channels) {
       var portName = app.channels[channel];
       console.log('Closing '+portName);
       if (app.ports[portName]) {
        app.ports[portName].close();
       } 
    }
    
    // delete the mapped serial ports
    app.ports = {};
    
    for (var channel in app.channels) {
               
       var portName = app.channels[channel];
       console.log('Reconnecting to '+portName);
         
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
       app.ports[portName] = new SerialPort(
           //"/dev/tty-usbserial1", {
            portName, {
            baudrate: 115200,
            dataBits : 8,
            stopBits : 1,
            parity : 'none'
          });
       
       //console.log(app.ports[app.channels[channel]]); 
    }
}

app.init = function(spClass) {
    
    //console.log(app.SerialPort);
}

app.changeChannel =  function(channel) {
    if (app.channels[channel]) {
        app.currentChannel = channel;
        log('Switching to '+channel);
        return true;
    } else {
        err('Channel '+channel+' not found. Use "/name port" command to define a new channel e.g. >/lora COM1');
        return false;
    }
}

// Build the title
app.title = app.name + ' v' +app.version+' '+app.tag;
console.log(app.title);
 
app.mapChannel('lora','COM1');
//app.map('bt','');

module.exports.app = app;