const WebSocket = require('ws');
let env = 'production';

process.argv.forEach((val, index) => {
  if (val === '--dev') {
    env = 'dev';
  }
});

const config = require(`./${env}.env`);

function noop () {
}

function heartbeat () {
  this.isAlive = true;
}

/**
 * Register an log
 * @param m
 * @param level 0 = Simple. For Dev env | 1 = Important. For Any Env
 */
const log = function (m, level) {
  level = typeof level !== 'undefined' ? level : 0;
  if (env === 'production' && level === 0) return;
  console.log(m);
}

log(`Start WebSocket Server in ${env} environment on port ${config.PORT}`, 1)

const options = {
  verifyClient: (info, done) => {
    log('Try to parsing session from request...');

    let logged = true;
    log('Session is parsed!');

    //
    // We can reject the connection by returning false to done(). For example,
    // reject here if user is unknown or token is invalid.
    //
    done(logged);

  },
  port: config.PORT
};
const wss = new WebSocket.Server(options);

wss.broadcast = function broadcast (data) {
  wss.clients.forEach(function each (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

wss.on('connection', function connection (ws, req) {
  const ip = req.connection.remoteAddress;
  log(`Connection open from ${ip}`, 1)
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  /**
   * Process an message and parse event. If valid, transmits for clients
   */
  ws.on('message', function incoming (message) {
    console.log(message)
    wss.broadcast(message)
  });

  ws.on('close', function listening (code, reason) {
    log(`Connection close from ${ip} with code ${code}, reason: ${reason}`, 1)
  })
});

const interval = setInterval(function ping () {
  wss.clients.forEach(function each (ws) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);