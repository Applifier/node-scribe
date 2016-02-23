var assert = require('assert');
var Scribe = require('../lib/scribe').Scribe;
var scribeServer = require('../test_utils/scribeserver');
var Logger = require('../lib/logger').Logger;

test('test construct', function(done) {
  var scribe = new Scribe("localhost", 8988);
  var logger = new Logger(scribe, "foo");
  assert.ok(scribe);
  assert.ok(logger);
  done();
});

test('test sending data', function(done) {
  var server = scribeServer.createServer();
  server.on('log', function(entry) {
    assert.equal(entry.length, 1, "Should have received one entry");
    assert.equal(entry[0].category, "foo");
    assert.ok(entry[0].message.indexOf("\tfoobar") > -1);
    assert.ok(entry[0].message.indexOf("\tDEBUG") > -1);
    setTimeout(function() {
      scribe.close();
      server.close();
      done();
    }, 500);
  });
  server.listen(8992);
  var scribe = new Scribe("localhost", 8992);
  var logger = new Logger(scribe, "foo");
  scribe.open(function(err, client) {
    logger.log("foobar");
  });
});

test('test batch sending data', function(done) {
  var server = scribeServer.createServer();
  server.on('log', function(entry) {
    assert.equal(entry.length, 6, "Should have received six entries");
    assert.equal(entry[0].category, "foo");
    assert.ok(entry[0].message.indexOf("\tfoobar") > -1);
    assert.ok(entry[0].message.indexOf("\tDEBUG") > -1);
    setTimeout(function() {
      scribe.close();
      server.close();
      done();
    }, 500);
  });
  server.listen(8992);
  var scribe = new Scribe("localhost", 8992);
  var logger = new Logger(scribe, "foo");
  scribe.open(function(err, client) {
    logger.logMessages(Logger.LOG_DEBUG, [
      "foobar1",
      "foobar2",
      "foobar3",
      "foobar4",
      "foobar5",
      "foobar6"
    ]);
  });
});

test('test replacing console', function(done) {
  var server = scribeServer.createServer();
  server.on('log', function(entry) {
    process.stdout.write('@log' + JSON.stringify(entry) + '\n');
    assert.equal(entry.length, 1, "Should have received one entry");
    assert.equal(entry[0].category, "foo");
    assert.ok(entry[0].message.indexOf("\tfoobar") > -1);
    assert.ok(entry[0].message.indexOf("\tDEBUG") > -1);
    setTimeout(function() {
      scribe.close();
      server.close();
      done();
    }, 500);
  });
  server.listen(8993);
  var scribe = new Scribe("localhost", 8993);
  var logger = new Logger(scribe, "foo");
  logger.replaceConsole();
  scribe.open(function(err, client) {
    console.log("foobar");
    logger.releaseConsole();
  });
});
