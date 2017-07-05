var https = require("https");
var _ = require('underscore')
var qs = require('qs');
var url = require('url');
var errors = require('./errors');
https.globalAgent.maxSockets = 100;

module.exports.Http = function(){
  function _Class(options){
  
    this.options = options;
    
    this._request = function(orig_request, req_options, post_data, callback){
      var request = https.request(req_options, function(api_res) {
        var headers = api_res.headers;
        if (api_res.statusCode <= 210 || api_res.statusCode == 422) {  
          api_res.setEncoding('utf8');
          var data = "";
          api_res.on('data', function (chunk) {
            data += chunk;
          });
          api_res.on('error', function (err) {
            callback(null,err);
          });
          api_res.on('end', function (chunk) {
            var object = null;
            var err = null;
            try{
              var arr = JSON.parse(data);
              if(_.isArray(arr)){
                object = _.map(arr,function(obj){
                  return obj;
                });
                if(headers['x-pagination']) {
                  object.pagination = JSON.parse(headers['x-pagination']);
                }
              }else{
                object = arr;
              }
            } catch(e) {
              err = new Error(e.message);
              err.body = data;
            }
            callback(object,err);
          });
        } else {
          var data = "";
          api_res.on("data",function(chunk) {
            data += chunk;
          });
          api_res.on("end",function(chunk) {
            try{
              var errorBody = JSON.parse(data);
              callback(null, new errors.ClientError(errorBody.error,api_res.statusCode,errorBody));
            } catch(e){
              err = new Error("ParseError "+e.message);
              err.body = data;
              callback(null,err);
            }
          });
        }  
      });
      request.callback = callback;
      request.middlewares = _.clone(options.middlewares).reverse();
      request.next = this.next;
      request.run_request = this.run_request;
      request.post_data = post_data;
      request.req_options = req_options;
      this.next(orig_request, request);
    };
    
    this.next = function(orig_request, request){
      if(request.middlewares.length > 0) {
        request.middlewares.pop()(orig_request, request, request.next);
      } else {
        request.run_request(request);
      }
    };
    
    this.run_request = function(request){
      if(request.req_options.method === 'PUT' || request.req_options.method === 'PATCH' || request.req_options.method === 'POST') {
        request.write(request.post_data);
      }
      request.on("response", function(response){
        //console.log(response.body);
      }).on("error", function(err){
        request.callback(null, new Error("Api responded with "+ err.message));
      });
      request.end();
    };
    
    this.get = function(orig_request, uri,callback){ 
      var req_options = _.extend({},options.api,{
        path: uri,
        method: 'GET',
        headers: {
          accept: 'json'
        }   
      });
      this._request(orig_request, req_options,null,callback)
    };  
    
    this.destroy = function(orig_request, uri,callback){ 
      var req_options = _.extend({},options.api,{
        path: uri,
        method: 'DELETE',
        headers: {
          accept: 'json'
        }   
      });
      this._request(orig_request, req_options,null,callback)
    };  
    
    this.put = function(orig_request, uri,post_data,callback){
      var req_options = _.extend({},options.api,{  
        path: uri,
        method: 'PUT',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
        }
      });
      this._request(orig_request, req_options, post_data, callback);
    };

    this.post = function(orig_request, uri,post_data,callback){
      var req_options = _.extend({},options.api,{  
        path: uri,
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
        }
      });
      this._request(orig_request, req_options, post_data, callback);
    };
  }
  return _Class;
}();
