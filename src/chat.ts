import {
  Widgets,
  screen as Screen,
  list as List,
  text as Text,
  box as Box,
  textbox as TextBox,
} from 'blessed';
import {getMessages, getMessagesBetween, getRooms, Message, Room} from './api';
import BoxElement = Widgets.BoxElement;
import dateFormat from 'dateformat';
import {getUser} from './auth';
import {close, connect} from './websocket';
import WebSocket from 'ws';
import {about} from './pages';

interface Page {
  name: string
  body: string
}

const aboutPage: Page = {
  name: "   -- ABOUT --   ",
  body: about
};
const pages = [aboutPage];


export async function ChatScreen(): Promise<Widgets.Screen> {

  let currentRoomIndex = 0;
  let messages: Message[] = [];
  let rooms: Array<Room | Page> = [...pages];

  const username = (await getUser()!).getUsername();

  const screen = Screen({
    smartCSR: true,
    autoPadding: true,
    // fullUnicode: true,
  });



  // Sidebar

  const sidebar = Box({
    parent: screen,
    width: 19,
    top: 0,
    left: 0,
  })

  const appText = Text({
    parent: sidebar,
    top: 0,
    left: 0,
    content: '{#5900ff-fg}     R A V E N',
    tags: true,
    width: '100%',
    height: '100%-1'
  });

  const roomsList = List({
    parent: sidebar,
    border: 'line',
    height: '100%-3',
    width: '100%',
    top: 1,
    left: 0,
    label: ' Rooms ',
    tags: true,
    mouse: true,
    keys: true,
    vi: true,
    style: {
      selected: {
        bg: 'white',
        fg: 'black',
      },
      item: {}
    },
    items: ['   -- ABOUT --   ']
  });

  const statusText = Text({
    parent: sidebar,
    bottom: 1,
    left: 0,
    tags: true,
    content: '[      READY      ]',
  });


  // Messages

  const mainBox = Box({
    parent: screen,
    top: 0,
    right: 0,
    width: '100%-20',
    height: '100%-1'
  });

  const messagesList = List({
    parent: mainBox,
    // border: 'line',
    height: '100%-1',
    width: '100%',
    top: 0,
    right: 0,
    tags: true,
    keys: true,
    mouse: true,
    vi: true,
    items: [],
    content: aboutPage.body,
    scrollable: true,
    alwaysScroll: true,
    style: {
      selected: {
        bg: '#1f1f1f'
      }
    }
  });

  const usernameText = Text({
    parent: mainBox,
    bottom: 0,
    left: 0,
    height: 1,
    tags: true,
    content: `{#00ffff-fg}[${username}]{/}`,
    width: username.length + 3,
  })

  const messageBox = TextBox({
    parent: mainBox,
    bottom: 0,
    right: 0,
    width: `100%-${usernameText.width}`,
    height: 1,
    mouse: true,
    inputOnFocus: true,
    keys: true,
    bg: '#262626'
  });


  // Bottom Bar

  const focusText = Text({
    parent: screen,
    bottom: 0,
    left: 0,
    height: 1,
    width: '100%',
    tags: true,
  });


  // Event Handlers

  async function itemSelected(item: BoxElement, number: number) {
    let element = rooms[number];
    currentRoomIndex = number;
    messagesList.setContent("");
    messagesList.clearItems();
    if ('body' in element) {
      let page = element as Page;
      messagesList.setContent(page.body);
      close();
      statusText.setContent('[      READY      ]');
      screen.render();
    } else {
      let room = element as Room;
      messageBox.focus();
      screen.render();
      await connectToRoom(room.name);
    }
  }
  roomsList.on('select', itemSelected);


  async function renderRooms() {
    roomsList.clearItems();
    rooms.forEach(room => roomsList.addItem(room.name));
    screen.render();
  }
  screen.on('show', renderRooms);

  async function fetchRooms() {
    try {
      rooms = [...pages, ...(await getRooms())];
      await renderRooms();
    } catch (e) {
      focusText.setContent('{red-fg}Unable to load rooms.{/red-fg}')
      throw e;
    }
    screen.render();
  }
  screen.on('show', fetchRooms);

  function formatMessage(message: Message): string {
    let timeSent = new Date(message.timeSent);
    let time = `{#525252-fg}${dateFormat(timeSent, "mm/dd/yy HH:MM:ss")}{/}`;
    let senderName = message.sender.replace(/^\$/g, "");
    let color = '#ff0000';
    if (senderName === username) {
      color = '#00ffff';
    } else if (senderName === 'server') {
      color = '#ff00ff';
    }
    let sender = `{${color}-fg}<${senderName}>{/}`;
    return `${time} ${sender} ${message.message}`;
  }

  async function renderMessages() {
    messagesList.clearItems();
    messages
      .slice(0)
      .reverse()
      .map(formatMessage)
      .forEach(msg => messagesList.addItem(msg));
  }

  async function pushMessage(message: Message) {
    messages.unshift(message);
    await renderMessages();
    messagesList.setScrollPerc(100);
    screen.render();
  }

  function sendMessage(ws: WebSocket) {
    const msg: Message = {
      action: "message",
      message: messageBox.getValue(),
      sender: username,
      roomName: rooms[currentRoomIndex].name,
      timeSent: Date.now(),
    }
    ws.send(JSON.stringify(msg));
    messageBox.clearValue();
    messageBox.focus();
    screen.render();
  }

  async function getMissedMessages() {
    let missed = await getMessagesBetween(rooms[currentRoomIndex].name, Date.now(), messages[0].timeSent);
    messages.unshift(...missed);
    await renderMessages();
    messagesList.setScrollPerc(100);
    screen.render();
  }

  async function connectToRoom(roomName: string) {
    try {
      statusText.setContent('[  Connecting...  ]');
      screen.render();

      const setupWs = async () => {
        let ws = await connect(roomName);
        ws.on('message', async (data) => {
          if (typeof data === "string") {
            await pushMessage(JSON.parse(data));
          }
        });
        const sendHandler = () => sendMessage(ws);
        ws.on('open', async () => {
          statusText.setContent('[    Connected    ]');
          screen.render();
          messageBox.key('enter', sendHandler);
          await getMissedMessages();
        });
        ws.on('close', () => messageBox.unkey('enter', sendHandler));
      }
      setupWs();

      messages = await getMessages(roomName);
      await renderMessages();
      messagesList.setScrollPerc(100);
    } catch (e) {
      statusText.setContent('[      Error      ]');
      throw e;
    }
    screen.render();
  }

  process.on('unhandledRejection', error => {
    screen.destroy();
    console.log(error);
    process.exit(-1);
  });

  async function exit() {
    return process.exit(0);
  }
  messageBox.key('C-c', exit);
  screen.key(['q', 'C-c'], exit);


  screen.key(['r', 'escape'], () => roomsList.focus());
  screen.key('s', () => messagesList.focus());
  screen.key('e', () => messageBox.focus());

  roomsList.on('focus', () => {
    focusText.setContent('{#3b3b3b-bg}--ROOMS--');
    screen.render();
  });
  messagesList.on('focus', () => {
    focusText.setContent('{#008000-bg}--SCROLL--');
    screen.render();
  });
  messageBox.on('focus', () => {
    focusText.setContent('{#000cb0-bg}--EDIT MESSAGE--');
    screen.render();
  });

  roomsList.focus();

  return screen;
}
