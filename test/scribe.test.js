var assert = require('assert');
var Scribe = require('../lib/scribe').Scribe;
var scribeServer = require('../test_utils/scribeserver');

test('test construct', function(done) {
  var scribe = new Scribe("localhost", 8988);
  assert.ok(scribe);
  done();
});

test('test connection opening', function(done) {
  var server = scribeServer.createServer();
  server.listen(8988);
  var scribe = new Scribe("localhost", 8988);
  scribe.open(function(err) {
    assert.ok(scribe.opened);
    scribe.close();
    assert.ok(!scribe.opened);
    setTimeout(function() {
      server.close();
      done();
    }, 500);
  });
});

test('test sending data', function(done) {
  var server = scribeServer.createServer();
  server.on('log', function(entry) {
    assert.equal(entry.length, 1, "Should have received one entry");
    assert.equal(entry[0].category, "foogroup");
    assert.equal(entry[0].message, "barmessage");
    setTimeout(function() {
      scribe.close();
      server.close();
      done();
    }, 500);
  });
  server.listen(8989);
  var scribe = new Scribe("localhost", 8989);
  scribe.open(function(err, client) {
    scribe.send("foogroup", "barmessage");
  });
});

test('test batch sending data', function(done) {
  var server = scribeServer.createServer();
  server.on('log', function(entry) {
    assert.equal(entry.length, 6, "Should have received 6 entries");
    setTimeout(function() {
      scribe.close();
      server.close();
      done();
    }, 500);
  });
  server.listen(8990);
  var scribe = new Scribe("localhost", 8990);
  scribe.open(function(err, client) {
    scribe.send("foogroup", [
      "barmessage1",
      "barmessage2",
      "barmessage3",
      "barmessage4",
      "barmessage5",
      "barmessage6",
    ]);
  });
});

test('test queuing data', function(done) {
  console.log('@test queue');
  var server = scribeServer.createServer();
  server.on('log', function(entry) {
    assert.equal(entry.length, 6, "Should have received 6 entries");
    setTimeout(function() {
      scribe.close();
      server.close();
      done();
    }, 500);
  });
  server.listen(8990);
  var scribe = new Scribe("localhost", 8990);
  scribe.send("foogroup1", "barmessage");
  scribe.send("foogroup2", "barmessage");
  scribe.send("foogroup3", "barmessage");
  scribe.send("foogroup4", "barmessage");
  scribe.send("foogroup5", "barmessage");
  scribe.send("foogroup6", "barmessage");
  scribe.open(function(err, client) {});
});
