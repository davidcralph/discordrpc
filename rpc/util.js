const { createConnection } = require('net');
const util                 = require('./util.js');

const getIPCPath = (id) => {
  if (process.platform === 'win32') return `\\\\?\\pipe\\discord-ipc-${id}`;
  const prefix = process.env.XDG_RUNTIME_DIR || process.env.TMPDIR || process.env.TMP || process.env.TEMP || '/tmp';
  return `${prefix.replace(/\/$/, '')}/discord-ipc-${id}`;
};

module.exports = class Util {
  static encode (op, data) {
    data = JSON.stringify(data);
    const len = Buffer.byteLength(data);
    const packet = Buffer.alloc(8 + len);
    packet.writeInt32LE(op, 0);
    packet.writeInt32LE(len, 4);
    packet.write(data, 8, len);
    return packet;
  }

  static decode(socket, callback) {
    const working = { full: '', op: undefined };
    const packet  = socket.read();
    if (!packet) return;

    let { op } = working;
    let raw;
    if (working.full === '') {
      op = working.op = packet.readInt32LE(0);
      raw = packet.slice(8, packet.readInt32LE(4) + 8);
    } else raw = packet.toString();

    try {
      let data = JSON.parse(working.full + raw);
      callback({op, data});
      working.full = '';
      working.op = undefined;
    } catch (err) { working.full += raw; }

    util.decode(socket, callback);
  }

  static getIPC (id = 0) {
    return new Promise((resolve, reject) => {
      const path = getIPCPath(id);
      const onerror = () => {
        if (id < 10) resolve(util.getIPC(id + 1));
        else reject(new Error('[Discord RPC] Could not connect'));
      };
      const sock = createConnection(path, () => {
        sock.removeListener('error', onerror);
        resolve(sock);
      });
      sock.once('error', onerror);
    });
  }

  //UUID function originally taken from https://github.com/discordjs/RPC/blob/master/src/util.js (MIT LICENSE)
  static uuid () {
    let uuid = '';
    for (let i = 0; i < 32; i += 1) {
      if (i === 8 || i === 12 || i === 16 || i === 20) uuid += '-';
      let n;
      if (i === 12) n = 4;
      else {
        const random = Math.random() * 16 | 0;
        if (i === 16) n = (random & 3) | 0;
        else n = random;
      }
      uuid += n.toString(16);
    }
    return uuid;
  }
};