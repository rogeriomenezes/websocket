const WebSocket = require('ws');
let env = 'production';

process.argv.forEach((val, index) => {
  if (val === '--dev') {
    env = 'dev';
  }
});

log(`Start WebSocket Server in ${env} environment`)

const wss = new WebSocket.Server({
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
  port: 8444
});

wss.on('connection', function connection (ws, req) {
  const ip = req.connection.remoteAddress;
  log('Connection open from ', ip)
  ws.on('message', function incoming (message) {
    log('received: %s', message);
    //log(req.connection)
    //log(req.session)
    //log(req)
  });

  ws.on('listening', function listening (t) {
    log('Listening...')
  })

  ws.on('open', function listening (t, a) {
    const ip = req.connection.remoteAddress;
    log('Connection open from ', ip)
  })

  ws.on('close', function listening (t, a) {
    log('Connection close', t, a)
  })
});

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