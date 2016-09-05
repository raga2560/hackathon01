var fs = require('fs-extra');
var path = require('path');
var crypto = require('crypto');
var request = require('request');
var bitcoin = require('bitcoinjs-lib');

var UsersDAO = require('../users').UsersDAO
  , SessionsDAO = require('../sessions').SessionsDAO
  , VisualappDAO = require('../visualapp').VisualappDAO
  , AssetstoreDAO = require('../assets').AssetstoreDAO
  , KeystoreDAO = require('../keystore').KeystoreDAO
  , EventstoreDAO = require('../events').EventstoreDAO
  , UserrecordDAO = require('../userrecord').UserrecordDAO
  
  , ConfappDAO = require('../confapp').ConfappDAO;

/* 
Receives request, makes call to colored coin interface, then updates database.

Createaccount-> create_account_colored -> store_keys_foruser
Create_assets-> create_assets_colored -> store_assets_ofuser

*/
/* The SessionHandler must be constructed with a connected db */

function postToApi(api_endpoint, json_data, callback) {
    console.log(api_endpoint+': ', JSON.stringify(json_data));
    request.post({
        url: 'http://testnet.api.coloredcoins.org:80/v3/'+api_endpoint,
        headers: {'Content-Type': 'application/json'},
        form: json_data
    }, 
    function (error, response, body) {
        if (error) return callback(error);
        if (typeof body === 'string') {
            body = JSON.parse(body)
        }
        console.log('Status: ', response.statusCode);
        console.log('Body: ', JSON.stringify(body));
        return callback(null, body);
    });
};

function getApi(api_endpoint, param, callback) {
    console.log('Get from:'+api_endpoint+'/'+param)
    request.get('http://testnet.api.coloredcoins.org:80/v3/'+api_endpoint+'/'+param, function (error, response, body) {
        if (error) {
            return callback(error)
        }
        if (typeof body === 'string') {
            body = JSON.parse(body)
        }
        console.log('Status:', response.statusCode)
        console.log('Body:', body)
        return callback(null, body)
    })
}



function signTx (unsignedTx, privateKey) {
    var tx = bitcoin.Transaction.fromHex(unsignedTx)
    var insLength = tx.ins.length
    for (var i = 0; i < insLength; i++) {
        tx.sign(i, privateKey)
    }
    return tx.toHex()
};

function Management (db) {
    "use strict";

    var users = new UsersDAO(db);
    var sessions = new SessionsDAO(db);
    var confapp = new ConfappDAO(db);
	var visualapp = new VisualappDAO(db);
	var keystore = new KeystoreDAO(db);
	var eventstore = new EventstoreDAO(db);
	var assetstore = new AssetstoreDAO(db);
	var userrecord = new UserrecordDAO(db);
	
	var uploadedimage = "";

	this.getloginuser = function(req, res) {
        "use strict";

        
		var session_id = req.cookies.session;
        sessions.getUsername(session_id, function(err, username1) {
            "use strict";

            if (!err && username1) {
              
			  var obj =
			  {
				username: username1  
			  };
			  return res.json(obj);
			}
			else {
				return res.json(false);
			}
            
        });
		
    
	}

	this.getassetowner = function(req, res) {
        "use strict";

		var assetId = req.body.assetid;
		
	getApi('stakeholders', assetId+'/1', function(err, body) {

    if (err) console.log('error: ', err)
		return res.json(body);
	});
	
	}
	
	this.getassetdetail = function(req, res) {
        "use strict";

		var assetId = req.body.assetId;
		var utxo = req.body.someUtxo +':1';
  
/*  
		 var assetId = 'LYfzkq2KP6K5rhNR7mE9B6BmhiHTtxvMxY'
var txid = '98a1ebf2b80eafe4cc58bb01e1eb74a09038e60a67032cacdb3dfb8bf83175de'
var utxo = txid+':1'
*/
	getApi('assetmetadata', assetId+'/'+utxo , function(err, body) {


    if (err) console.log('error: ', err)
		return res.json(body);
	});
	
	}

	this.signandsendasset = function(req, res) {
        "use strict";

       
	   var asset = req.body.asset;
		var txHex = asset.txHex;
		var assetId = asset.assetId;
		
		var session_id = req.cookies.session;
        sessions.getUsername(session_id, function(err, username1) {
            "use strict";

            if (!err && username1) {
              var  username = username1;
  
			//var unsignedTx = txHex;


			keystore.getkeys(username,function(err, object) {
			if(err) return res.json({error:err});
			else {
				
				console.log(object);
				
				
				var key1 = object.testnet.privatekey ;
			
				var key = bitcoin.ECKey.fromWIF(key1);

			var sign = signTx(txHex,key);

			console.log('Signed: '+sign);
			var signedTxHex = sign;
			
			var data_params = {
			'txHex': signedTxHex
			};

			console.log('signed: '+signedTxHex)

			postToApi('broadcast',data_params,function(err, body){
				if (err) console.log('error: '+err);
				
					res.json(body);
			});

/*

{"address":"mpP6iqSDweyTFHTUZAo4ZVX5MJkhr4GAnT","utxos":[{"index":1,"txid":"696aca3f203e9b09ff1f2bb1628f3e7ff9400c802d07e15c1c8201c7e0b76f62","blocktime":1472728381000,"blockheight":926257,"value":100000,"used":false,"scriptPubKey":{"asm":"OP_DUP OP_HASH160 613cd6ced630d1fde1cc2f1d4ce34a37b6c6ab3d OP_EQUALVERIFY OP_CHECKSIG","hex":"76a914613cd6ced630d1fde1cc2f1d4ce34a37b6c6ab3d88ac","reqSigs":1,"type":"pubkeyhash","addresses":["mpP6iqSDweyTFHTUZAo4ZVX5MJkhr4GAnT"]},"assets":[]},{"index":1,"txid":"648548844aa931e72051a920968cb4dcce5a83d2dd03ffdc3ff88d7445df5865","blocktime":1472728381000,"blockheight":926257,"value":100000,"used":false,"scriptPubKey":{"asm":"OP_DUP OP_HASH160 613cd6ced630d1fde1cc2f1d4ce34a37b6c6ab3d OP_EQUALVERIFY OP_CHECKSIG","hex":"76a914613cd6ced630d1fde1cc2f1d4ce34a37b6c6ab3d88ac","reqSigs":1,"type":"pubkeyhash","addresses":["mpP6iqSDweyTFHTUZAo4ZVX5MJkhr4GAnT"]},"assets":[]}]}

after issuing asset below

{"address":"mpP6iqSDweyTFHTUZAo4ZVX5MJkhr4GAnT","utxos":[{"index":1,"txid":"648548844aa931e72051a920968cb4dcce5a83d2dd03ffdc3ff88d7445df5865","blocktime":1472728381000,"blockheight":926257,"value":100000,"used":false,"scriptPubKey":{"asm":"OP_DUP OP_HASH160 613cd6ced630d1fde1cc2f1d4ce34a37b6c6ab3d OP_EQUALVERIFY OP_CHECKSIG","hex":"76a914613cd6ced630d1fde1cc2f1d4ce34a37b6c6ab3d88ac","reqSigs":1,"type":"pubkeyhash","addresses":["mpP6iqSDweyTFHTUZAo4ZVX5MJkhr4GAnT"]},"assets":[]},{"index":0,"txid":"da6bb38c8828c398e2dd943f5cdc381fb004c2ec0a5a009e69ef1d377b5f130d","blocktime":1472801123705,"blockheight":-1,"value":600,"used":false,"scriptPubKey":{"asm":"OP_DUP OP_HASH160 613cd6ced630d1fde1cc2f1d4ce34a37b6c6ab3d OP_EQUALVERIFY OP_CHECKSIG","hex":"76a914613cd6ced630d1fde1cc2f1d4ce34a37b6c6ab3d88ac","reqSigs":1,"type":"pubkeyhash","addresses":["mpP6iqSDweyTFHTUZAo4ZVX5MJkhr4GAnT"]},"assets":[{"assetId":"La6T8wU1kffP5LAohxHRBm8XfauPLvEyh7wrN1","amount":100,"issueTxid":"da6bb38c8828c398e2dd943f5cdc381fb004c2ec0a5a009e69ef1d377b5f130d","divisibility":0,"lockStatus":true,"aggregationPolicy":"aggregatable"}]},{"index":2,"txid":"da6bb38c8828c398e2dd943f5cdc381fb004c2ec0a5a009e69ef1d377b5f130d","blocktime":1472801123705,"blockheight":-1,"value":94400,"used":false,"scriptPubKey":{"asm":"OP_DUP OP_HASH160 613cd6ced630d1fde1cc2f1d4ce34a37b6c6ab3d OP_EQUALVERIFY OP_CHECKSIG","hex":"76a914613cd6ced630d1fde1cc2f1d4ce34a37b6c6ab3d88ac","reqSigs":1,"type":"pubkeyhash","addresses":["mpP6iqSDweyTFHTUZAo4ZVX5MJkhr4GAnT"]},"assets":[]}]}


*/			
			
/*
{
  "txid": [
    {
      "txid": "da6bb38c8828c398e2dd943f5cdc381fb004c2ec0a5a009e69ef1d377b5f130d"
    }
  ]
}
*/
			
            }
			});
			
			}
		});
			
		
	
    }

	this.getaddresscontents = function(req, res) {
        "use strict";
		var address = 'mpP6iqSDweyTFHTUZAo4ZVX5MJkhr4GAnT';

				getApi('addressinfo', address , function(err, body) {

    if (err) console.log('error: ', err)
		res.json(body);
		});


				
				

	}
	
	this.getbuyers = function(req, res) {
        "use strict";
		

		var session_id = req.cookies.session;
        sessions.getUsername(session_id, function(err, username1) {
            "use strict";

            if (!err && username1) {
              var  username = username1;
        
		var type = 'buyer';
		userrecord.listuserrecords(username, type, function(err, obj) {
				if (err) return res.json({error:err});
				return res.json(obj);
			});
			
			}
			
		else {
				 return res.json({error:err});
			}
            
        });
	}
	
	this.getowners = function(req, res) {
        "use strict";
		

		var session_id = req.cookies.session;
        sessions.getUsername(session_id, function(err, username1) {
            "use strict";

            if (!err && username1) {
              var  username = username1;
        
		var type = 'seller';
		userrecord.listuserrecords(username, type, function(err, obj) {
				if (err) return res.json({error:err});
				return res.json(obj);
			});
			
			}
			
		else {
				 return res.json({error:err});
			}
            
        });
	}
    
	this.gettestnetassets = function(req, res) {
        "use strict";
		

		var session_id = req.cookies.session;
        sessions.getUsername(session_id, function(err, username1) {
            "use strict";

            if (!err && username1) {
              var  username = username1;
        
		assetstore.getassets(username,  function(err, obj) {
				if (err) return res.json({error:err});
				return res.json(obj);
			});
			
			}
			
		else {
				 return res.json({error:err});
			}
            
        });

				
				

	}	
	
	this.createbuyer = function(req, res) {
        "use strict";

     var network = req.body.network;
			var data = {
					
					name : req.body.name,
					role:'buyer',
					resaddress : req.body.resaddress,
					sellerterms : req.body.sellerterms,
					
					mainnet:{},
					testnet:{}
					
				};
				
		var session_id = req.cookies.session;
        sessions.getUsername(session_id, function(err, username1) {
            "use strict";

            if (!err && username1) {
              var  username = username1;
            
			
		   console.log("username="+username);
		   
		   
		   {
			key = bitcoin.ECKey.makeRandom();
			var address = key.pub.getAddress().toString();
			console.log('new bitcoin address: ['+address+']');

			var wif = key.toWIF();
			console.log('new mainnet address: ['+address+']');
			console.log('Private Key of new address (WIF format): ['+wif+']');
	
			
			data.mainnet.address = address;
			data.mainnet.privatekey = wif;
			
			
				
			}
			{
			
			var key = bitcoin.ECKey.makeRandom();
			//var address = key.getAddress().toString();
			var address = key.pub.getAddress(bitcoin.networks.testnet).toString();
			var wif = key.toWIF();
			console.log('new TESTNET address: ['+address+']');
			console.log('Private Key of new address (WIF format): ['+wif+']');
			
			
			data.testnet.address = address;
			data.testnet.privatekey = wif;
			
			
			}
			
           userrecord.insertuser(username, data, function(err, object) {
			if(err) return res.json({error:err});
			else {
					return res.json(object);
			}
			});
			}
			else {
				return res.json({error:err});
			}
		});

				
				
				
			
    }
	
	
	
	this.createseller = function(req, res) {
        "use strict";

     var network = req.body.network;
			var data = {
					
					role:'seller',
					name : req.body.name,
					resaddress : req.body.resaddress,
					sellerterms : req.body.sellerterms,
					
					mainnet:{},
					testnet:{}
					
				};
				
		var session_id = req.cookies.session;
        sessions.getUsername(session_id, function(err, username1) {
            "use strict";

            if (!err && username1) {
              var  username = username1;
            
			
		   console.log("username="+username);
		   
		   
			{
			key = bitcoin.ECKey.makeRandom();
			var address = key.pub.getAddress().toString();
			console.log('new bitcoin address: ['+address+']');

			var wif = key.toWIF();
			console.log('new mainnet address: ['+address+']');
			console.log('Private Key of new address (WIF format): ['+wif+']');
	
			
			data.mainnet.address = address;
			data.mainnet.privatekey = wif;
			
			}
				
			{
			
			var key = bitcoin.ECKey.makeRandom();
			//var address = key.getAddress().toString();
			var address = key.pub.getAddress(bitcoin.networks.testnet).toString();
			var wif = key.toWIF();
			console.log('new TESTNET address: ['+address+']');
			console.log('Private Key of new address (WIF format): ['+wif+']');
			
			
			data.testnet.address = address;
			data.testnet.privatekey = wif;
			
			
			}
			
           userrecord.insertuser(username, data, function(err, object) {
			if(err) return res.json({error:err});
			else {
					return res.json(object);
			}
			});
			}
			else {
				return res.json({error:err});
			}
		});

				
				
				
			
    }
	
	
	
	this.createevent = function(req, res) {
        "use strict";

     var network = req.body.network;
			var data = {
					network : req.body.network,
					title : req.body.title,
					description : req.body.description,
					sellerterms : req.body.sellerterms,
					buyerterms : req.body.buyerterms,
					mainnet:{},
					testnet:{}
					
				};
				
		var session_id = req.cookies.session;
        sessions.getUsername(session_id, function(err, username1) {
            "use strict";

            if (!err && username1) {
              var  username = username1;
            
			
		   console.log("username="+username);
		   
		   
			{
			key = bitcoin.ECKey.makeRandom();
			var address = key.pub.getAddress().toString();
			console.log('new bitcoin address: ['+address+']');

			var wif = key.toWIF();
			console.log('new mainnet address: ['+address+']');
			console.log('Private Key of new address (WIF format): ['+wif+']');
	
			data.network = 'mainnet';
			data.mainnet.address = address;
			data.mainnet.privatekey = wif;
			
			
				
			}
			{
			var key = bitcoin.ECKey.makeRandom();
			//var address = key.getAddress().toString();
			var address = key.pub.getAddress(bitcoin.networks.testnet).toString();
			var wif = key.toWIF();
			console.log('new TESTNET address: ['+address+']');
			console.log('Private Key of new address (WIF format): ['+wif+']');
			
			data.network = 'testnet';
			data.testnet.address = address;
			data.testnet.privatekey = wif;
			
			
			}
			
           eventstore.insertevent(username, data, function(err, object) {
			if(err) return res.json({error:err});
			else {
					return res.json(object);
			}
			});
			}
			else {
				return res.json({error:err});
			}
		});

				
				
				
			
    }
	
	
	
	
	this.listevents = function(req, res) {
        "use strict";

     
		
		var session_id = req.cookies.session;
        sessions.getUsername(session_id, function(err, username1) {
            "use strict";

            if (!err && username1) {
              var  username = username1;
            
			
		   console.log("username="+username);
           eventstore.listevents(username,function(err, object) {
			if(err) return res.json({error:err});
			else {
				res.json(object);
			}
			
		});
		
			}
			else {
				if (err) return res.json({error:err});
			}
            
        });
	
    }
	
	
	this.createkeys = function(req, res) {
        "use strict";

    
		var network = req.body.network;
	
		var username ;
        var data = {
			network: '',
			mainnet:{},
			testnet: {}
			
		};
	
			var session_id = req.cookies.session;
        sessions.getUsername(session_id, function(err, username1) {
            "use strict";

            if (!err && username1) {
                username = username1;
            
			if(network == 'mainnet'){
			key = bitcoin.ECKey.makeRandom();
			var address = key.pub.getAddress().toString();
			console.log('new bitcoin address: ['+address+']');

			var wif = key.toWIF();
			console.log('new mainnet address: ['+address+']');
			console.log('Private Key of new address (WIF format): ['+wif+']');
	
			data.network = 'mainnet';
			data.address = address;
			data.privatekey = wif;
			data.publickey = 'xxx';
			
				
			}else if(network == 'testnet'){
			
			var key = bitcoin.ECKey.makeRandom();
			//var address = key.getAddress().toString();
			var address = key.pub.getAddress(bitcoin.networks.testnet).toString();
			var wif = key.toWIF();
			console.log('new TESTNET address: ['+address+']');
			console.log('Private Key of new address (WIF format): ['+wif+']');
			
			data.network = 'testnet';
			data.address = address;
			data.privatekey = wif;
			data.publickey = 'xxx';
			
			
			}else {
				
				return res.json(false);
			}
			
			
			

			console.log("username="+username);
            keystore.insertkeys(username, data, function(err, user) {
				if (err) return res.json({error:err});
				return res.json(user);
			});
			
			
			}
			else {
				return res.json(false);
			}
            
        });
		
    
	}
	
	
}

module.exports = Management;
