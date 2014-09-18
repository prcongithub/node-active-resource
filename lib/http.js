var http = require("http");
var _ = require('underscore')
var qs = require('qs');
var url = require('url');
http.globalAgent.maxSockets = 100;

module.exports.Http = function(){
  function _Class(options){
    this.options = options;
    this.api_request = function(uri,callback){ 
      var req_options = _.extend({},options,{
        path: uri,
        method: 'GET',
        headers: {
          accept: 'json'
        }   
      });
      //console.log("*************** Calling API GET *********************");
      //console.log(req_options);
      http.request(req_options, function(api_res) {
        //console.log('STATUS: ' + api_res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(api_res.headers));
        if (api_res.statusCode >= 300) {
          callback(null,new Error("Api responded with "+ api_res.statusCode));
          //throw new Error("Api responded with "+ api_res.statusCode);
        } else {  
          var data = "";
          api_res.on('data', function (chunk) {
            data += chunk;
          });
          api_res.on("error", function(err){
            //console.log(err);
            callback(null,err);
          });
          api_res.on("end", function(){
            var arr = JSON.parse(data);
            if(_.isArray(arr)){
              var new_arr = _.map(arr,function(obj){
                return obj[Object.keys(obj)[0]];
              });
              callback(new_arr);
            }else{
              var object = arr[Object.keys(arr)[0]];
              callback(object);
            }
          });
        }
      }).on("response", function(response){
        //console.log("Response Received");
        //callback(null);
      }).on("error", function(err){
        //console.log(err);
        callback(null, new Error("Api responded with "+ err.message));
        //throw new Error("Api responded with "+ err.message);
      }).end();
    };  
  }
  return _Class;
}();
