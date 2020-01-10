var qs = require('qs');
var _ = require('underscore');
var nodeVger = require('../index');
var Http = require('./http').Http;
var http = new Http(nodeVger.config);
var extend = require("extend");
var Paths = require("./paths");

var Scope = function(resource,conditions){
  this.resource = resource;
  this.conditions = conditions ? conditions : {};
};

Scope.prototype.where = function(conditions){
  this.conditions = extend(true, this.conditions, conditions); 
  return this;
};

Scope.prototype.all = function(request, callback){
  var uri = qs.stringify(this.conditions, { arrayFormat: 'brackets' });
  var scope = this;
  uri = this.collectionPath() + "?" + uri;
  var req_options = extend({
    uri: uri
  }, this.resource.api);
  http.get(request, req_options, function(data_arr, error, api_response){
    if(error) {
      callback(null, error, api_response);
    } else {
      var arr = [];
      _.each(data_arr, function(data){
        var object = new scope.resource(data);
        arr.push(object);
      });
      arr.pagination = data_arr.pagination;
      callback(arr, error, api_response);
    }
  });
};

Scope.prototype.find = function(request, id, callback){
  var uri = qs.stringify(this.conditions, { arrayFormat: 'brackets' });
  uri = this.collectionPath() + "/" + id + "?" + uri;
  var scope = this;
  var req_options = extend({
    uri: uri
  }, this.resource.api);
  http.get(request, req_options, function(data, error, api_response){
    if(error) {
      callback(null, error, api_response);
    } else {
      var object = new scope.resource(data);
      callback(object, error, api_response);
    }
  });
};

Scope.prototype.collectionPath = function(){
  return Paths.generateURL(this.resource.collectionPath, this.conditions);
};

module.exports = Scope;
