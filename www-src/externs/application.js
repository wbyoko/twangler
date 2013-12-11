/**
 * @fileoverview Externs for HTML5 NewsReader
 * @externs
 */

/* console externs */

function console(){}

/**
 * [log description]
 * @param  {*} arg1 [description]
 */
console.log = function(arg1){};

/**
 * @type {string}
 */
var dQ;

/**
 * @param  {string} query [description]
 */
function $(query){}

/*
sjcl.decrypt(this.currentUser.pid, this.currentUser.p)
sjcl.encrypt(pid, password)
*/


/** 
 * @constructor
 */
function Codebird(){};

/**
 * Sets the OAuth consumer key and secret (App key)
 *
 * @param {string} key
 * @param {string} secret
 */
Codebird.prototype.setConsumerKey = function(key, secret){};

/**
 * Sets the OAuth request or access token and secret (User key)
 *
 * @param {string} token 
 * @param {string} secret
 */
Codebird.prototype.setToken = function(token, secret){};

/**
 * Main API handler working on any requests you issue
 *
 * @param {string} fn            The member function you called
 * @param {Object.<string, *>} params        The parameters you sent along
 * @param {function(*)} callback      The callback to call with the reply
 * @param {boolean=} opt_app_only_auth
 */
Codebird.prototype.__call = function (fn, params, callback, opt_app_only_auth){};

/* End of application.js */