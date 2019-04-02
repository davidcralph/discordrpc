// Based on the pc-hastebin and GeneralSettings.jsx settings menu!
const { React }                           = require('powercord/webpack');
const { TextInput, SwitchItem, Category } = require('powercord/components/settings');

module.exports = class Settings extends React.Component {
  constructor (props) {
    super();

    this.settings = props.settings;
    this.state = {
      clientid: props.settings.get('clientid', null),
      lineone: props.settings.get('lineone', 'Hello!'),
      linetwo: props.settings.get('linetwo', null),
      timestamp: props.settings.get('timestamp', false),
      textSettings: props.settings.get('textSettings', false),
      largeimage: props.settings.get('largeimage', 'null'),
      smallimage: props.settings.get('smallimage', 'null'),
      largeimagetext: props.settings.get('largeimagetext', 'null'),
      smallimagetext: props.settings.get('smallimagetext', 'null'),
      imageSettings: props.settings.get('imageSettings', false),
      commandsEnabled: props.settings.get('commandsEnabled', false)
    };
  }

  render () {
    const settings = this.state;
    const set = (key, value = !settings[key], defaultValue) => {
      if (key === 'commandsEnabled') powercord.pluginManager.get('pc-discordrpc').modifyCommands();
      if (!value && defaultValue) value = defaultValue;
      this.settings.set(key, value);
      this.setState({ [key]: value });
    };

    return (
      <div>
        <TextInput
          note='ID used to start the Discord RPC.'
          defaultValue={settings.clientid}
          required={true}
          onChange={val => set('clientid', val, null)}
        >
          Client ID
        </TextInput>
        <Category
          name='Text Settings'
          description={<span>Settings for the Discord RPC text.</span>}
          opened={settings.textSettings}
          onChange={() => set('textSettings')}
        >
        <TextInput
          note='First line of the Discord RPC.'
          defaultValue={settings.lineone}
          required={true}
          onChange={val => set('lineone', val, 'Hello!')}
        >
          Line One
        </TextInput>
        <TextInput
          note='Second line of the Discord RPC.'
          defaultValue={settings.linetwo}
          required={false}
          onChange={val => set('linetwo', val, null)}
        >
          Line Two
        </TextInput>
        </Category>
        <Category
          name='Image Settings'
          description={<span>Settings for the Discord RPC images.</span>}
          opened={settings.imageSettings}
          onChange={() => set('imageSettings')}
        >
        <TextInput
          note='Large image shown on the Discord RPC.'
          defaultValue={settings.largeimage}
          required={false}
          onChange={val => set('largeimage', val, null)}
        >
          Large Image
        </TextInput>
        <TextInput
          note='Text shown when hovering over the large image.'
          defaultValue={settings.largeimagetext}
          required={false}
          onChange={val => set('largeimagetext', val, null)}
        >
          Large Image Text
        </TextInput>
        <TextInput
          note='Small image shown on the Discord RPC.'
          defaultValue={settings.smallimage}
          required={false}
          onChange={val => set('smallimage', val, null)}
        >
          Small Image
        </TextInput>
        <TextInput
          note='Text shown when hovering over the small image.'
          defaultValue={settings.smallimagetext}
          required={false}
          onChange={val => set('smallimagetext', val, null)}
        >
          Small Image Text
        </TextInput>
        </Category>
        <SwitchItem
            note='Timestamp for the Discord RPC.'
            value={settings.timestamp}
            onChange={() => set('timestamp')}
          >
            Timestamp
          </SwitchItem>
          <SwitchItem
            note='Enable/Disable the commands for controlling the Discord RPC.'
            value={settings.commandsEnabled}
            onChange={() => set('commandsEnabled')}
          >
            Commands
          </SwitchItem>
      </div>
    );
  }
};
