/* eslint-disable curly */
const Settings   = require('./Settings.jsx');
const { React }  = require('powercord/webpack');
const { Plugin } = require('powercord/entities');
const { remote } = require('electron');

module.exports = class DiscordRPC extends Plugin {
  startPlugin () {
    this.registerSettings('pc-discordrpc', 'Discord RPC', () => React.createElement(Settings, { settings: this.settings }));

    const DiscordRPC = require('./rpc/index.js');

    // eslint-disable-next-line object-property-newline
    const uRPC      = new DiscordRPC({ clientID: this.settings.get('clientid', null), debug: false }); // debug gang, lets not debug for now
    const timestamp = new Date().getTime();

    const setActivity = async () => {
      switch (this.settings.get('timestamp')) {
        case true: {
          uRPC.send('SET_ACTIVITY', {
            pid: process.pid,
            activity: {
              details: this.settings.get('lineone', 'Hello!'),
              state: this.settings.get('linetwo', 'I am cool.'),
              assets: {
                large_image: this.settings.get('largeimage', 'null'),
                large_text: this.settings.get('largeimagetext', 'null'),
                small_image: this.settings.get('smallimage', 'null'),
                small_text: this.settings.get('smallimagetext', 'null')
              },
              timestamps: { start: timestamp },
              instance: false
            }
          });
          break;
        }
        case false: {
          uRPC.send('SET_ACTIVITY', {
            pid: process.pid,
            activity: {
              details: this.settings.get('lineone', 'Hello!'),
              state: this.settings.get('linetwo', 'I am cool.'),
              assets: {
                large_image: this.settings.get('largeimage', 'null'),
                large_text: this.settings.get('largeimagetext', 'null'),
                small_image: this.settings.get('smallimage', 'null'),
                small_text: this.settings.get('smallimagetext', 'null')
              },
              instance: false
            }
          });
        }
      }
    }

    uRPC.on('ready', () => { 
      setActivity();
      setInterval(setActivity, 15e3);
    });

    if (this.settings.get('commandsEnabled')) this.loadCommands();
  }

  modifyCommands () {
    switch (this.settings.get('commandsEnabled')) {
      case true: {
        this.settings.set('commandsEnabled', true);
        this.loadCommands();
        break;
      }
      case false: {
        this.settings.set('commandsEnabled', false);
        this.unloadCommands();
      }
    }
  }

  loadCommands () {
    powercord
      .pluginManager
      .get('pc-commands')
      .register(
        'timestamp',
        'Enable/Disable Discord RPC timestamp.',
        '{c} [true/false]',
        (args) => {
          if (args[0] === 'true') return this.settings.set('timestamp', true);
          else if (args[0] === 'false') return this.settings.set('timestamp', false);
        }
      );

    powercord
      .pluginManager
      .get('pc-commands')
      .register(
        'lineone',
        'Edit line one of the Discord RPC.',
        '{c} [data]',
        (args) => {
          return this.settings.set('lineone', args.join(' '));
        }
      );

    powercord
      .pluginManager
      .get('pc-commands')
      .register(
        'linetwo',
        'Edit line two of the Discord RPC.',
        '{c} [data]',
        (args) => {
          return this.settings.set('linetwo', args.join(' '));
        }
      );

    powercord
      .pluginManager
      .get('pc-commands')
      .register(
        'largeimage',
        'Change the large image of the Discord RPC.',
        '{c} [data]',
        (args) => {
          return this.settings.set('largeimage', args.join(' '));
        }
      );

    powercord
      .pluginManager
      .get('pc-commands')
      .register(
        'largeimagetext',
        'Change the large image hover text on the Discord RPC.',
        '{c} [data]',
        (args) => {
          return this.settings.set('largeimagetext', args.join(' '));
        }
      );

    powercord
      .pluginManager
      .get('pc-commands')
      .register(
        'smallimage',
        'Change the small image of the Discord RPC.',
        '{c} [data]',
        (args) => {
          return this.settings.set('smallimage', args.join(' '));
        }
      );

    powercord
      .pluginManager
      .get('pc-commands')
      .register(
        'smallimagetext',
        'Change the small image hover text on the Discord RPC.',
        '{c} [data]',
        (args) => {
          return this.settings.set('smallimagetext', args.join(' '));
        }
      );
  }

  unloadCommands () {
    powercord
      .pluginManager
      .get('pc-commands')
      .unregister('lineone');

    powercord
      .pluginManager
      .get('pc-commands')
      .unregister('linetwo');

    powercord
      .pluginManager
      .get('pc-commands')
      .unregister('largeimage');

    powercord
      .pluginManager
      .get('pc-commands')
      .unregister('largeimagetext');

    powercord
      .pluginManager
      .get('pc-commands')
      .unregister('smallimage');

    powercord
      .pluginManager
      .get('pc-commands')
      .unregister('smallimagetext');

    powercord
      .pluginManager
      .get('pc-commands')
      .unregister('timestamp'); 
  }

  pluginWillUnload () {
    remote.getCurrentWindow().reload();
  }
};
