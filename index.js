const WebSocket = require('ws');

const wss = new WebSocket.Server({
  verifyClient: (info, done) => {
    console.log('Parsing session from request...');
    console.log('Session is parsed!');
    //
    // We can reject the connection by returning false to done(). For example,
    // reject here if user is unknown.
    //
    done(true);

  },
  port: 8444
});

wss.on('connection', function connection (ws, req) {
  ws.on('message', function incoming (message) {
    console.log('received: %s', message);
  });

  // ws.send('algo');
});