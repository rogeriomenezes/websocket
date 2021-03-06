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
  
  const ip = typeof req.headers['x-forwarded-for'] !== 'undefined' ? req.headers['x-forwarded-for'].split(/\s*,\s*/)[0] : req.connection.remoteAddress;
  
  log(`Connection open from ${ip}`, 1)
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  
  if (typeof req.headers['token'] !== 'undefined' && typeof req.headers['type'] !== 'undefined' && String(req.headers['type']) === 'gateway') {
    console.log("\x1b[32m%s\x1b[0m", 'GATEWAY CONNECTED')
    ws.isGateway = true
    /*ws.$interval = setInterval(() => {
      if (ws.isAlive === false){
        clearInterval(ws.$interval)
        console.log("\x1b[31m%s\x1b[0m", 'GATEWAY DISCONNECTED')
        ws.terminate();
      }
      ws.isAlive = false;
      ws.ping(noop);
    }, 10000)*/
  }

  /**
   * Process an message and parse event. If valid, transmits for clients
   */
  ws.on('message', function incoming (message) {
    log(`Try to send message by ${ip}: ${message}`, 1)
    let authorized = false;
    // Atualmente só permite a transmissão por parte da API com um token válido
    if (typeof req.headers['token'] !== 'undefined' && req.headers['token'] === config.TOKEN) {
      authorized = true;
    }

    if (!authorized) {
      ws.send('Você não tem autorização :/')
      log(`Client ${ip} has no permission to send`, 1)
      return;
    }

    //Authorized
    wss.broadcast(message)
    log(`Message by ${ip} sent`, 1);
  });

  ws.on('close', function listening (code, reason) {
    log(`Connection close from ${ip} with code ${code}, reason: ${reason}`, 1)
  })
});

const interval = setInterval(function ping () {
  wss.clients.forEach(function each (ws) {
    if (ws.isAlive === false){
      if(typeof ws.isGateway !== 'undefined'){
        console.log("\x1b[31m%s\x1b[0m", 'GATEWAY DISCONNECTED')
      }
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);
