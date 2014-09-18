var nodeVger = require('../index');
var Http = require('./http').Http;
var http = new Http(nodeVger.config);
module.exports = function(){
  this.collectionPath = function(){
    throw new Error("Collection path is not specified.");
  }
  
  this.fetch = function(callback){
    http.api_request(this.collectionPath(), callback);
  }
};
