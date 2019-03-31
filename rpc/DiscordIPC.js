const EventEmitter               = require('events');
const { encode, decode, getIPC } = require('./util.js');

/*
Codes Key:
  HANDSHAKE: 0,
  FRAME: 1,
  CLOSE: 2,
  PING: 3,
  PONG: 4,
*/

module.exports = class IPCTransport extends EventEmitter {
  constructor(clientID) {
    super();
    this.clientID = clientID;
    this.socket = null;
  }

  async connect() {
    const socket = this.socket = await getIPC();
    this.emit('open');
    socket.write(encode(0, { v: 1, client_id: this.clientID }));
    socket.pause();
    socket.on('readable', () => {
      decode(socket, ({op, data}) => {
        switch (op) {
          case 3: this.send(data, 4); 
            break;
          case 1: 
          if (!data) return;
            this.emit('message', data);
            break;
            case 2: this.emit('close', data);
            break;
          default: break;
        }
      });
    });
    socket.on('close', this.onClose.bind(this));
    socket.on('error', this.onClose.bind(this));
  }

  onClose(e) { this.emit('close', e); }

  send(data, op = 1) { this.socket.write(encode(op, data)); } //frame

  close() {
    this.send({}, 2); //close
    this.socket.end();
  }
}
