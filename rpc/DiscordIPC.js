/* eslint-disable curly */
const EventEmitter = require('events');
const DiscordIPC = require('./DiscordIPC.js');
const uuid = require('./uuid.js');

module.exports = class DiscordRPC extends EventEmitter {
  constructor ({ clientID, debug }) {
    super();
    this.debug = debug;

    this.discordIPC = new DiscordIPC(clientID);

    this.discordIPC.on('open', () => {
      if (this.debug) console.log('[Discord IPC] Status: open');
    });

    this.discordIPC.on('close', (event) => {
      if (this.debug) console.log('[Discord IPC] Status: close', event);
    });

    this.discordIPC.on('error', (event) => {
      if (this.debug) console.log('[Discord IPC] Error', event);
    });

    this.discordIPC.on('message', (event) => {
      switch (event.evt) {
        case 'READY':
          if (this.debug) console.log('[Discord RPC] Status: ready');
          this.emit('ready');
          break;
        default:
          if (this.debug) console.log('[Discord IPC] Message', event);
          break;
      }
    });

    this.discordIPC.connect();
  }

  send (cmd, args) {
    this.discordIPC.send({
      cmd,
      args,
      nonce: uuid()
    });
  }
};
