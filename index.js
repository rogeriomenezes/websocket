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
    const ip = req.connection.remoteAddress;
    console.log(ip)
    //console.log(req.connection)
    //console.log(req.session)
    //console.log(req)
  });
  
  ws.on('listening', function listening (t) {
    console.log('Listening...')
  })

  ws.on('close', function listening (t, a) {
    console.log('Connection close', t, a)
    wss.clients.forEach(function each(client) {
      console.log('Client ', client)
    })
  })

  ws.send(['teste', 'algo']);
});

const interval = setTimeout(function ping() {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send('teste', {test: 1});
      //console.log(client.session)
    }
  });
}, 10000);
