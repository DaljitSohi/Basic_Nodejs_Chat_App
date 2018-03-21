
const express = require('express');
var app = express(); //Instace of express

/*Setting Up Socket.io
  1st. Setting up 'http' Server with node, and connect it to express
  2nd. Setting up the 'socket.io' package, and passing a reference to the http server.
  3rd. Add <script rc="/socket.io/socket.io.js"></script> to the html
  4rd. Change the app.listen code to "http.listen(port#)"
*/
const http = require('http').Server(app); //setup the server, and passing our express 'app'
const io = require('socket.io')(http); //setup socket.io, and then pass a reference to our http server

const bodyparser = require('body-parser');

app.use(express.static(__dirname)); //Static View to use

app.use(bodyparser.json())//set up bodyparser as our middleware to handle JSON requests
app.use(bodyparser.urlencoded({extended: false}));

const mongoose = require('mongoose');
var dbUrl = "mongodb://ChatApp:chatapp@ds231588.mlab.com:31588/node_chat_app";
//Setup our Message model
var Message = mongoose.model('Message', {
  name: String,
  message: String
});

var messages = [
  {
    name: 'Tim',
    message: 'Hi'
  },
  {
    name: 'Jane',
    message: 'Hello There'
  }
];

//Routes
// app.get('/', function(req, res){
//
// });

//Retrive Messages from the Database, and send them in a response
app.get('/messages', function(req, res){
  Message.find({}, function(err, messages){
    res.send(messages);
  });
});

//Store Chat Message to the DataBase
app.post('/messages', function(req, res){
  var message = new Message(req.body);
  console.log(req.body.message);

  message.save(function(err){
    if(err){
      sendStatus(500);
    }

    io.emit('message', req.body);
    res.sendStatus(200);
  });
});

io.on('connection', function(socket){
  console.log('new user connected');

  socket.on('disconnect', function(socket){
    console.log('a user has disconnect');
  });

  io.emit('newUser');
});

var server = http.listen(3000, function(){
  console.log("Listening on port", server.address().port + ".........");
});//start the express service

//Connect to MongoDB on mLab
mongoose.connect(dbUrl, function(err) {
  if(err){
    console.log("Database Error.\n", err);
  }
  console.log("connected to mongoDB");
});
