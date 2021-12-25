const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const PORT = 8081;

const curlTests = { //TODO: store test on a separate file for ease of management
  kykvitCurl: ['-I', 'https://kykvit.com'],
  kykvitExpected: "", //TODO: accept the curl as valid when everything specified here is found in stdout of curl.
  anotherCurl: "",
  anotherExpected: "",
};

var curlLog = []; //TODO: open log file and continue it

function curl() {
  const test = spawn('curl', curlTests.kykvitCurl);

  test.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    data = curlBeautifier(data);
    curlLog.push([Date.now(),data]);
    console.log(curlLog);
    storeLog(curlLog);
  });

  // test.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`);
  // });

  // test.on('close', (code) => {
  //   console.log(`child process exited with code ${code}`);
  // });
}


function curlBeautifier(data) { //TODO: remove line breaks from curl's output.
  return data.toString('utf8'); 
};


function storeLog(data) {
  let fd;

  try {
    fd = fs.openSync('message.txt', 'a');
    fs.appendFileSync(fd, JSON.stringify(data) + '\r\n', 'utf8');
  } catch (err) {
    console.error('storeLog error.')
  } finally {
    if (fd !== undefined)
      fs.closeSync(fd);
  }
};


curl();


function requestListener(req, res) {
  res.writeHead(200);
  res.end('Hello, World!'); //TODO: the webpage
}

const server = http.createServer(requestListener);
server.listen(PORT);
console.log(`listening on port ${PORT}`);