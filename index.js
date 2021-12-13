const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const PORT = process.env.PORT || 8888;

app.use(express.static('public')); // Serve Static Assets

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
