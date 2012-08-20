var Logger = require('./logger');

function randomString() {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var string_length = 16;
  var randomstring = '';
  for (var i = 0; i < string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return randomstring;
}

var stackRegex = new RegExp("Error.+?\t.+?\t.+?\t +?at (.+?)\t.+");

var extractCalledFromStack = function () {
  var stack = new Error().stack;
  stack = stack.replace(/\n/g, "\t");

  var r = stackRegex.exec(stack);

  if (r == null) {
    return "";
  }
  return r[1];
};


var logMessage = function (level, req, msg) {

  var line = extractCalledFromStack();

  req.log.writer(level, req.id, line, msg);
};

exports.factory = function (writer) {
  return function (req, res) {

    var id = randomString();

    req.log = {
      debug:function () {
        logMessage(Logger.Logger.LOG_DEBUG, req, Logger.format.apply(this, arguments));
      },
      info:function () {
        logMessage(Logger.Logger.LOG_INFO, req, Logger.format.apply(this, arguments));
      },
      warn:function () {
        logMessage(Logger.Logger.LOG_WARNING, req, Logger.format.apply(this, arguments));
      },
      error:function () {
        logMessage(Logger.Logger.LOG_ERROR, req, Logger.format.apply(this, arguments));
      },
      critical:function () {
        logMessage(Logger.Logger.LOG_CRITICAL, req, Logger.format.apply(this, arguments));
      },
      id:id,
      writer:writer
    };
  };

};


