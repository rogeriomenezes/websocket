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
  const ip = req.connection.remoteAddress;
  console.log('Connection open from ', ip)
  ws.on('message', function incoming (message) {
    console.log('received: %s', message);
    //console.log(req.connection)
    //console.log(req.session)
    //console.log(req)
  });

  ws.on('listening', function listening (t) {
    console.log('Listening...')
  })

  ws.on('open', function listening (t, a) {
    const ip = req.connection.remoteAddress;
    console.log('Connection open from ', ip)
  })

  ws.on('close', function listening (t, a) {
    console.log('Connection close', t, a)
  })

  ws.send('Hello Brother, i am a websocket server :)');
});

const interval = setInterval(function ping () {
  wss.clients.forEach(function each (client) {
    if (client.readyState === WebSocket.OPEN) {
      let data = {
        type: 'lance',
        data: {
          leilao: 1,
          lote: {
            id: 10,
            lance: {
              id: 200,
              data: '2018-07-10 09:01:27',
              valor: 13200.00,
              arrematante: {
                id: 50,
                apelido: 'TIAGOFELIPE',
                localidade: 'Montes Claros - MG'
              }
            }
          }
        }
      }
      client.send(JSON.stringify(data));
      //console.log(client.session)
    }
  });
}, 5000);
