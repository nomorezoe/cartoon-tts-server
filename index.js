const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { instrument } = require("@socket.io/admin-ui");
const TTS = require('./tts');


let tts = new TTS();
tts.initialize();


app.all("/", function (req, res, next) {
  // Website you wish to allow to connect
  //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:7456');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  return next();
});

app.get('/output/', (req, res) => {
  console.log(req.query.fileName);
  res.sendFile(__dirname + '/output/' +req.query.fileName + '.wav');
});


io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on("disconnect", (reason) => {
    console.log("a user left");
  })

  socket.on("tts", (text) => {
    onTextRecieved(socket, text);
  })

});

instrument(io, {
  auth: false
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

function onTextRecieved(socket, text) {
  console.log("onTextRecieved", text);
  tts.excute(text, function(result){
    console.log("onTTSCompleted", result);
    socket.emit('onTTSCompleted', result);
  });
}