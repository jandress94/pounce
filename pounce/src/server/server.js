var express = require('express'); // Express contains some boilerplate to for routing and such
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var shuffle = require('shuffle-array');

var cards = require('../shared/js/cards');

var d = new cards.Deck();
console.log(d);
shuffle(d.cards);
console.log(d);

app.use('/js/shared', express.static(path.resolve(__dirname + '/../shared/js')));
app.use('/js/client', express.static(path.resolve(__dirname + '/../client/js')));
app.use('/css', express.static(path.resolve(__dirname + '/../client/css')));
app.use('/favicon.ico', express.static(path.resolve(__dirname + '/../resources/imgs/spade.ico')));

// Serve the index page 
app.get("/", function (request, response) {
  console.log(__dirname);
  response.sendFile(path.resolve(__dirname + '/../client/html/index.html'));
});

// Listen on port 5000
app.set('port', (process.env.PORT || 5000));
http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});

// Tell Socket.io to start accepting connections
io.on('connection', function(socket){
    console.log("New client has connected with id:",socket.id);

    socket.emit('get_shuffled_deck', d);
});

