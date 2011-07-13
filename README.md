# node-scribe
Scribe client for node.js
## Installation
    $ npm install scribe
## Basic example
Example of sending log entries to scribe server.

    var Scribe = require('scribe').Scribe;

    var scribe = new Scribe("localhost", 1234, {autoReconnect:true});

    scribe.open(function(err){

      if(err) {
        return console.log(err);
      }

      scribe.send("foocategory", "foomessage");

      scribe.close();

    });

## autoReconnect = true
If autoReconnect is set to true and connection fails, client will store log entries to queue and flush when connection has be re-established.

## Logger
Logger is an drop-in replacement for the default console object. Each log entry contains the level, hostname, pid, caller (file and position) and the log message given as parameter. Values are separated by tabulators.

### Log levels
Levels are defined by the function used or by hand when using the logMessage function.<br />
    0 : EMERG <br />
    1 : ALERT <br />
    2 : CRITICAL (critical)<br />
    3 : ERROR (error)<br />
    4 : WARN (warn)<br />
    5 : NOTICE<br />
    6 : INFO (info)<br />
    7 : DEBUG (debug, log)<br />

### Example
Example of using logger to replace node:s console object.

    var Scribe = require('scribe').Scribe;
    var Logger = require('scribe').Logger;

    var scribe = new Scribe("localhost", 1234, {autoReconnect:true});
    var logger = new Logger(scribe, "foobar");
    scribe.open(function(err){

      if(err) {
        return console.log(err);
      }

      logger.log("foomessage");

      logger.replaceConsole(); // replaces console with logger

      console.log("foobar");

      logger.releaseConsole(); // reverts changes made by replaceConsole();

      scribe.close();

    });


## License
(The MIT License)

Copyright(c) 2011 Applifier Ltd.<br />

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.