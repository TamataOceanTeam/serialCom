
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

// ******************************
// CONFIG INIT
// ******************************
var jsonfile = require('jsonfile')
jsonfile.spaces = 4;
var configFile = "config.json";
var DEBUG = true;

jsonfile.readFile(configFile, function(err, data) {
    jsonConfig = data;

    if (err) throw err;
    serialport = data.system.serialport.port;
    baud = data.system.serialport.baud;
    begin();
});

// ******************************
// SERIAL INIT
// ******************************

// **************************** 
// SERIAL Communication section
// **************************** 
function begin(){

	if (DEBUG) {
		console.log('.............. CONFIG .............');
		console.log('SerialPort ='+ JSON.stringify(jsonConfig.system.serialport) ) ;
		console.log('Serial Baud rate ='+ JSON.stringify(jsonConfig.system.serialport.baud) ) ;
    }
        
    /* LISTENING on SERIAL */
    let parser
    
    const port = new SerialPort( serialport, { baudRate: baud })
    port.on('error', function(err) {
        console.log('Error: ', err.message)
    })
    
    port.on('open', function () {
        port.write('Init_connection_from_Raspi', function(err) {
        if (err) {
        return console.log('Error: ', err.message);
        }
        console.log('message init sent');
        });
    })

    parser = port.pipe(new Readline({ delimiter: '\r\n' }))
    console.log("Listening on serial")
    
    const nmea = require('node-nmea')
    const gprmc = require('gprmc-parser')
    
    parser.on('data', function (data) {
        console.log(data)
        
        // Using emLead GPS
        //if (data.includes("$GNRMC")) {
            
            // Using USB GPS classic
			if (data.includes("$GPRMC")) {
                //console.log(nmea.parse(data))
				// Using USB GPS classic	
				resolve(nmea.parse(data));
				
				// Using emLid GPS 
				// resolve(gprmc(data));
			}
        })  

    // **************************** 
    /* EXPRESS.JS -------------- */  
    // **************************** 
    var express = require('express');
    var session = require('cookie-session'); // Charge le middleware de sessions
    var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
    var urlencodedParser = bodyParser.urlencoded({ extended: false });
    var app = express();
    var ejs_index = 'indexW3.ejs';
    /* Config JSON indent mode */
    jsonfile.spaces = 4;
    /* Using sessions */
    app.use(session({secret: 'SerialCommunication'}))
    /* --------------------------- Index print ------------------------ */
    /* ---------------------------------------------------------------- */
    .get('/', function(req, res) {
        // console.log('htttp request on / ');
        res.render(ejs_index, {
            title : "Serial Com - Home",
        });
        
    })

    /* --------------------------- Command?cmd_id --------------------- */
    /* ---------------------------------------------------------------- */
    .get('/command', function(req, res) {
        console.log('Command requested : '+ req.query.cmd_id);
        port.write(req.query.cmd_id , function(err){
            if (err) {
                return console.log('Error : ', err.message);
            }
            console.log('command ' + req.query.cmd_id + 'sent');
            res.redirect('/');
        })
    })

    /* ---------------------- Unknown Page -----------------------------*/
    /* -----------------------------------------------------------------*/
    .use(function(req, res, next){
        //console.log('Invalid adress sent !! : '+res);
        res.redirect('/');
    });

    app.on('connect',function(req,res) {
        port.write('WebUser_init', function(err) {
            if (err) {
            return console.log('Error: ', err.message);
            }
            console.log('message login sent');
        });
        console.log('new user arrived');
    });
    app.listen(8080);
    console.log('WEB SERVER started on port 8080');
    console.log('-------------------------------');

}