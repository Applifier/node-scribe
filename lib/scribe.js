var sys = require('sys');
var events = require('events');

var thrift = require('thrift');
var scribe = require('./gen-nodejs/scribe');
var scribe_types = require('./gen-nodejs/scribe_types');

var Scribe = exports.Scribe = function(host, port, opt) {
  var self = this;

  this.host = host;
  this.port = Number(port);

  this.autoReconnect = opt && opt.autoReconnect ? true : false;
  this.autoReconnectTimeout = [];
  this.reconnecting = false;

  this.retries = 0;
  this.opened = true;

  if (opt && opt.autoReconnectTimeout) {
    if (opt.autoReconnectTimeout.constructor === Number) {
      this.autoReconnectTimeout = [opt.autoReconnectTimeout];
    } else if (opt.autoReconnectTimeout.constructor === Array) {
      for (var i = 0; i < opt.autoReconnectTimeout.length; i++) {
        var timeout = opt.autoReconnectTimeout[i];
        if (timeout.constructor === Number) {
          throw new Error("autoReconnectTimeout should be Number or Array of numbers");
        }
        this.autoReconnectTimeout.push(timeout);
      }
    } else {
      throw new Error("autoReconnectTimeout should be Number or Array of numbers");
    }
  }

  this.client = null;
  this.connection = null;

  this.queue = [];

  // Define getters
  this.__defineGetter__("connected", function() {
    if (self.connection != null) {
      return self.connection.connected;
    } else {
      return false;
    }
  });

  // Define getters
  this.__defineGetter__("writable", function() {
    if (self.connection != null) {
      return self.connection.connection.writable;
    } else {
      return false;
    }
  });

};

sys.inherits(Scribe, events.EventEmitter);

Scribe.prototype.open = function(callback) {
  var self = this;
  this.opened = true;
  this.connection = thrift.createConnection(this.host, this.port);
  this.client = thrift.createClient(scribe, this.connection);

  this.connection.once('error', function(err) {
    if (callback) {
      callback(err, self);
      callback = null;
    }
  });
  this.connection.once('connect', function() {
    self.retries = 0;
    self.emit('connect');

    if (self.queue.length > 0) {
      self.flush();
    }

    if (callback) {
      callback(null, self);
      callback = null;
    }
  });

  this.connection.on('error', function(err) {
    self.processError(err);
  });
};

Scribe.prototype.close = function() {
  this.opened = false;
  this.connection.end();
};

Scribe.prototype.flush = function() {
  var self = this;
  if (!this.writable) {
    if (this.opened && this.autoReconnect) {
      this.retryConnection();
    }
    return;
  }
  var queue = this.queue;
  this.queue = [];
  this.client.Log(queue, function(err, resultCode) {
    if (resultCode === 1 || err) {
      self.queue = self.queue.concat(queue);
    }
  });

};

Scribe.prototype.processError = function(err) {
  this.emit('error', err);

  if (this.autoReconnect && !this.writable) {
    this.retryConnection();
  }

};

Scribe.prototype.retryConnection = function() {
  if (this.reconnecting) {
    return;
  }
  var self = this;
  this.reconnecting = true;
  var timeout = 3000;
  if (this.autoReconnectTimeout.length > 0) {
    if (this.retries < this.autoReconnectTimeout.length) {
      timeout = this.autoReconnectTimeout[this.retries];
    } else {
      timeout = this.autoReconnectTimeout[this.autoReconnectTimeout.length - 1];
    }
  }

  setTimeout(function() {
    self.emit('reconnecting');
    self.open(function() {
      self.reconnecting = false;
    });
  }, timeout);

  this.retries++;

};

Scribe.prototype.send = function(category, message) {

  var entry = new scribe_types.LogEntry({
    category : category,
    message : message
  });

  this.queue.push(entry);
  this.flush();

};