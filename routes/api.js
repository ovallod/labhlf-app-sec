'use strict';

//blockchain
const HLFInvoke = require('../hlfsdk/hlfinvoke.js');
let channelID = 'defaultchannel';
let ccId = 'labhlf-ov-secured-sc';
let util = require('util');

module.exports.initHlfAPP = async function (req, res) {
    // Initialise the keystore with the registrar user: it will allow to enroll the other users. 
    // this requires to have the network-profile.json file in the config folder.
    try {
        let hlfinvoke = new HLFInvoke(channelID);
        let result = await hlfinvoke.enrollRegistrar();
        if (result.rc > 0) {
            res.status(403).json({ func: "initHlfAPP", err: error, status: result.message });
        } else {
            res.json({ func: "initHlfAPP", err: null, status: result.message });
        }
    } catch (error) {
        res.status(403).json({ func: "initHlfAPP", err: error, status: "error raised" });
    }
}


module.exports.orderShipment = async function (req, res) {
    console.log('Executing orderShipment');
    let apiname = 'OrderShippment';
    // ensure that the request is authenticated
    if (!req.isAuthenticated || req.isAuthenticated != true) {
        // not authenticated
        console.error(apiname + ' api, request not authenticated!!!');
        res.status(401).json({ api: apiname, isAuthenticated: false, err: apiname + '_Auth', errmsg: 'request not authenticated' });
    } else {
        // authenticated
        let bcuser = req.basicAuth.bcuser;
        let bcpwd = req.basicAuth.bcpwd;
        ////////////
        console.log(apiname + ', Before HLFInvoke!');
        let hlfinvoke = new HLFInvoke(channelID);
        // login check if user exist and is enrolled
        try {
            console.log(apiname + ', Before HLFInvoke.login!');
            await hlfinvoke.login(bcuser, bcpwd);
        } catch (e) {
            // if error, then we need to get the user password 
            return {
                action: 'askforpwd',
                status: 'KO Login error',
                err: (e.stack ? e.stack : e)
            };

        }

        // retrieve posted data
        let reqBody = '';
        req.on('data', function (chunk) {
            // append the current chunk of posted data to the reqBody letiable
            reqBody += chunk.toString();
        });
        req.on('end', async function () {
            //console.log("reqBody: "+reqBody); // reqBody sent as json string
            let body_data = {};
            let parse_err = false;
            try {
                // parse reqBody data using JSON parse if provided as json string	
                console.log(apiname + ', Before JSON.parse !' + reqBody);
                body_data = JSON.parse(reqBody);;
                console.log(apiname + ', After JSON.parse !' + util.inspect(body_data, { depth: null, compact: true }));

                // check input mandatory attributes                           
                let err_msg = '';
                err_msg += (body_data.packageID ? '' : (err_msg ? ', packageID' : 'packageID'));
                err_msg += (body_data.description ? '' : (err_msg ? ', description' : 'description'));
                err_msg += (body_data.destination ? '' : (err_msg ? ', destination' : 'destination'));

                console.log(apiname + ', Before test error = error.length!' + err_msg.length);
                if (err_msg.length == 0) {
                    let tranArgs = JSON.stringify(body_data);


                    // Call the chaincode with the admin user, to run the transaction orderShipment
                    console.log(apiname + ', Before HLFInvoke.invoke!');
                    //tranArgs="{\"packageID\":\"P2\",\"description\":\"Package for product P002\",\"destination\": \"Montpellier, FRANCE, 34006\"}"
                    let restmp = await hlfinvoke.invoke(bcuser, ccId, apiname, tranArgs);
                    console.log(apiname + ', After HLFInvoke!' + util.inspect(restmp));

                    if (restmp.rc > 0) {
                        res.status(403).json({ api: apiname, err: apiname + '_Blockchain', bcuser: bcuser, errmsg: (restmp.message || restmp.details) });
                    } else {
                        res.json({ api: apiname, err: null, txid: (restmp.txid || '') });
                    }
                } else {
                    //error relative to the content of the request body has been detected
                    res.status(403).json({ api: apiname, isAuthenticated: true, err: apiname + '_Data', errmsg: 'Empty or missing mandatory data: ' + err_msg });
                }

            } catch (e) {
                console.error(apiname + ', Invalid character or wrong JSON input objet format!!!' + e);
                res.status(403).json({ api: apiname, isAuthenticated: true, err: apiname + '_DataFormat', errmsg: 'Invalid character or wrong JSON input objet format!!!' });
            }

        });

    }
};
