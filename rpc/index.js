/* eslint-disable object-property-newline */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undefined */
/* eslint-disable curly */
const net = require('net');
const EventEmitter = require('events');

const OPCodes = {
  HANDSHAKE: 0,
  FRAME: 1,
  CLOSE: 2,
  PING: 3,
  PONG: 4,
};

class IPCTransport extends EventEmitter {

  constructor (clientID) {
    super();
    // this.client = client;
    this.clientID = clientID;
    this.socket = null;
  }

  async connect () {
    const socket = this.socket = await getIPC();
    this.emit('open');
    socket.write(encode(OPCodes.HANDSHAKE, {
      v: 1,
      client_id: this.clientID
    }));
    socket.pause();
    socket.on('readable', () => {
      decode(socket, ({ op, data }) => {
        switch (op) {
          case OPCodes.PING:
            this.send(data, OPCodes.PONG);
            break;
          case OPCodes.FRAME:
            if (!data)
              return;
            this.emit('message', data);
            break;
          case OPCodes.CLOSE:
            this.emit('close', data);
            break;
          default:
            break;
        }
      });
    });
    socket.on('close', this.onClose.bind(this));
    socket.on('error', this.onClose.bind(this));
  }

  onClose (e) {
    this.emit('close', e);
  }

  send (data, op = OPCodes.FRAME) {
    this.socket.write(encode(op, data));
  }

  close () {
    this.send({}, OPCodes.CLOSE);
    this.socket.end();
  }

  ping () {
    // this.send(Snowflake.generate(), OPCodes.PING);
  }
}

function encode (op, data) {
  data = JSON.stringify(data);
  const len = Buffer.byteLength(data);
  const packet = Buffer.alloc(8 + len);
  packet.writeInt32LE(op, 0);
  packet.writeInt32LE(len, 4);
  packet.write(data, 8, len);
  return packet;
}

const working = {
  full: '',
  op: undefined
};

function decode (socket, callback) {
  const packet = socket.read();
  if (!packet)
    return;

  let { op } = working;
  let raw;
  if (working.full === '') {
    op = working.op = packet.readInt32LE(0);
    const len = packet.readInt32LE(4);
    raw = packet.slice(8, len + 8);
  } else {
    raw = packet.toString();
  }

  try {
    const data = JSON.parse(working.full + raw);
    callback({ op, data }); // eslint-disable-line callback-return
    working.full = '';
    working.op = undefined;
  } catch (err) {
    working.full += raw;
  }

  decode(socket, callback);
}

function getIPCPath (id) {
  if (process.platform === 'win32') return `\\\\?\\pipe\\discord-ipc-${id}`;
  const { env } = process;
  const prefix = env.XDG_RUNTIME_DIR || env.TMPDIR || env.TMP || env.TEMP || '/tmp';
  return `${prefix.replace(/\/$/, '')}/discord-ipc-${id}`;
}

function getIPC (id = 0) {
  return new Promise((resolve, reject) => {
    const path = getIPCPath(id);
    const onerror = () => {
      if (id < 10) resolve(getIPC(id + 1));
      else reject(new Error('Could not connect'));
    };
    const sock = net.createConnection(path, () => {
      sock.removeListener('error', onerror);
      resolve(sock);
    });
    sock.once('error', onerror);
  });
}

module.exports = IPCTransport;
module.exports.encode = encode;
module.exports.decode = decode;
