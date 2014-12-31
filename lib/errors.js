module.exports.ClientError = function(){
  var _Class = function(msg) {
    this.name = "ClientError";
    this.message =  msg || "Client Error";
    this.status = 399;
  }
  return _Class;
}();

module.exports.RecordNotFound = function(){
  var _Class = function(msg) {
    this.name = "RecordNotFound";
    this.message =  msg || "Record Not Found";
    this.status = 404;
  }
  return _Class;
}();

module.exports.BadGatewayError = function(){
  var _Class = function(msg) {
    this.name = "BadGatewayError";
    this.message =  msg || "Bad Gateway Error";
    this.status = 502;
  }
  return _Class;
}();

module.exports.Unauthorized = function(){
  var _Class = function(msg) {
    this.name = "Unauthorized";
    this.message =  msg || "Unauthorized";
    this.status = 401;
  }
  return _Class;
}();
