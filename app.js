'use strict';

const express = require('express');
const errorHandler = require('errorhandler');
const cors = require('cors');
const authconfig = require('./security/oauth-config');
let auth = require('./security/auth');


//routes
//const routes = require('./routes');

// Express configuration
const app = express();
app.use(cors());




//Enable reverse proxy support in Express. This causes the
//the "X-Forwarded-Proto" header field to be trusted so its
//value can be used to determine the protocol. See
//http://expressjs.com/api#app-settings for more details.
//see also app.set('trust proxy', 1) // trust first proxy
app.enable('trust proxy');

//Register '.html' extension with ejs
app.engine('html', require('ejs').renderFile);
//Configure view engine to render EJS templates.
app.set('view engine', 'html');
//app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(errorHandler(true));

//routes
const api = require('./routes/api.js');


///////// UNPROTECTED Routes ////////////
//home page
app.get('/', (request, response) => response.render('home',{title: 'API server - (DEMO Blockchain)'}));

// Call the initialisation of the hlf application
app.get('/api/inithlfapp',api.initHlfAPP); 

///////// PROTECTED Routes ////////////

// request for Ordering a shipment :
// the request body should contain "{\"packageID\":\"P1\",\"description\":\"Package for product P001\",\"destination\": \"Montpellier, FRANCE, 34006\"}
app.post('/api/ordershipment',auth.checkbasicauth,api.orderShipment);


///////////// START the server on local or IBM Cloud /////////////////
var port = 3010;
app.listen(port, 'localhost', function () {
    // print a message when the server starts listening
    console.log("server started on localhost port: " + port);
});





