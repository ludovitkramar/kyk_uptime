const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

var curlTestsDefinitions = {};
var PORT = 8080;
var interval = 10000;
var command = 'curl';
var testNames = [];

try { //open config file
  const configfile = fs.readFileSync("logger.conf").toString();
  curlTestsDefinitions = JSON.parse(configfile);
  PORT = curlTestsDefinitions["PORT"];
  interval = curlTestsDefinitions["INTERVAL"];
  command = curlTestsDefinitions["COMMAND"];
} catch (error) {
  throw 'ERROR when trying to open and parse the config file.'
}

class curlTest {
  testsLog = [];
  constructor(testName, test, expected) {
    this.testName = testName;
    this.test = test;
    this.expected = expected;
    console.log(`${this.testName} is active`);
    this.performTest();
    var self = this;
    var curlInterval = setInterval(function () {
      console.log(`Interval reached every ${interval}ms`);
      self.performTest();
    }, interval);
  }

  performTest() {
    const curlTest = spawn(command, this.test);
    curlTest.stdout.on('data', (data) => {
      //console.log(`stdout: ${data}`);
      var result = this.processData(data);
      var toLog = ([Date.now(), result]);
      //console.log(toLog);
      this.storeLog(toLog);
    });
    curlTest.stderr.on('data', (data) => {
      //console.log('curl error:' + data)
      this.errorLog([Date.now(), 'stderr', data.toString()]);
    })
    console.log(`A test has been performed for ${this.testName}.`);
  }

  processData(data) { //returns a number: 0=down, 1=up, 2=test was partially succesful, 3=mysterious error
    const str = data.toString('utf8');
    var match = false; //turns true when found a match
    var mismatch = false; //turns true when didn't find a match
    for (key in this.expected) {
      if (str.indexOf(this.expected[key]) != -1) {
        match = true;
      } else {
        mismatch = true;
      }
    }
    if (match == false && mismatch == true) {
      //completely wrong data
      this.errorLog([Date.now(), "badResponse", str]);
      return 0
    } else if (match == true && mismatch == true) {
      //some test passed, some did not
      this.errorLog([Date.now(), "partialResponse", str]);
      return 2
    } else if (match == true && mismatch == false) {
      //all tests passed! congratulations!
      return 1
    } else if (match == false && mismatch == false) {
      //error, this shouldn't happen
      this.errorLog([Date.now(), "horribleError", str]);
      return 3
    };
  };

  storeLog(data) {
    let fd;
    try {
      fd = fs.openSync(`${this.testName}.log`, 'a');
      fs.appendFileSync(fd, JSON.stringify(data) + '\r\n', 'utf8');
    } catch (err) {
      console.error('storeLog error.')
    } finally {
      if (fd !== undefined)
        fs.closeSync(fd);
    }
    console.log(`Logged the test for ${this.testName}`);
  }

  errorLog(data) {
    let fd;
    try {
      fd = fs.openSync(`${this.testName}-errors.log`, 'a');
      fs.appendFileSync(fd, JSON.stringify(data) + '\r\n', 'utf8');
    } catch (err) {
      console.error('error when logging an error')
    } finally {
      if (fd !== undefined)
        fs.closeSync(fd);
    }
    console.log(`Logged an error for ${this.testName}`);
  }
};

for (key in curlTestsDefinitions) { //create the objects
  if (key.indexOf("Test") != -1) {
    const test = curlTestsDefinitions[key]; // array of arguments for curl
    const testName = key.slice(0, key.indexOf("Test")); //name of the test
    const expected = curlTestsDefinitions[`${testName}Expected`]; //array of strings that should be found in the output of curl.
    eval(`var ${key} = new curlTest(testName, test, expected)`); //create curlTest object with the name it was given in the definitions array.
    testNames.push(testName);
  }
}

function requestListener(req, res) {
  if (req.url === "/") {
    fs.readFile('index.html', function (err, data) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    })
  } else if (req.url === "/style.css") {
    fs.readFile('style.css', function (err, data) {
      res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
      res.end(data);
    })
  } else if (req.url === "/favicon.ico") {
    fs.readFile('favicon.ico', function (err, data) {
      res.writeHead(200, { "Content-Type": "image/x-icon" });
      res.end(data);
    })
  } else if (req.url === "/lmsans10-regular.otf") {
    fs.readFile('lmsans10-regular.otf', function (err, data) {
      res.writeHead(200, { "Content-Type": "font/otf" });
      res.end(data);
    })
  } else if (req.url === "/logger.conf") {
    fs.readFile('logger.conf', function (err, data) {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(data);
    })
  } else if (req.url === "/tests.json") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(testNames));
  } else if (req.url.slice(req.url.length - 4, req.url.length) === ".log") {
    const reqLog = req.url.slice(1, req.url.length - 4);
    if (testNames.indexOf(reqLog) != -1) {
      fs.readFile(`${reqLog}.log`, function (err, data) {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(data);
      })
    } else {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end('Log not found');
    }
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end('Not found');
  }
}

const server = http.createServer(requestListener);
server.listen(PORT);
console.log(`listening on port ${PORT}`);