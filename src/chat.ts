import {
  Widgets,
  screen as Screen,
  list as List,
  textarea as TextArea,
  text as Text,
  line as Line,
} from 'blessed';
import {getMessages, getRooms, Message, Room} from './api';
import BoxElement = Widgets.BoxElement;
import dateFormat from 'dateformat';
import BlessedContrib from 'blessed-contrib';

interface Page {
  name: string
  body: string
}

const aboutPage: Page = {
  name: "--about--",
  body: "Welcome!\n\nThis is the welcome page."
};
const pages = [aboutPage];

export function ChatScreen(): Widgets.Screen {

  let currentRoomIndex = 0;
  let messages: Message[] = [];
  let rooms: Array<Room | Page> = [...pages];


  const screen = Screen({
    smartCSR: true,
    autoPadding: true,
    // fullUnicode: true,
  });

  const roomsList = List({
    parent: screen,
    border: 'line',
    height: '100%-1',
    width: '20%',
    top: 0,
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
    items: ['--about--']
  });

  const messagesList = List({
    parent: screen,
    // border: 'line',
    height: '100%-6',
    width: '80%',
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

  const messageBox = TextArea({
    parent: screen,
    border: 'line',
    label: " Message ",
    bottom: 1,
    right: 0,
    width: '80%',
    height: 4,
    mouse: true,
    inputOnFocus: true,
    keys: true,
  });

  const statusText = Text({
    parent: screen,
    bottom: 0,
    left: 0,
    content: 'Ready',
    tags: true,
  });

  async function itemSelected(item: BoxElement, number: number) {
    let element = rooms[number];
    currentRoomIndex = number;
    messagesList.setContent("");
    messagesList.clearItems();
    if ('body' in element) {
      let page = element as Page;
      messagesList.setContent(page.body);
      screen.render();
    } else {
      let room = element as Room;
      screen.render();
      await connectToRoom(room.name);
    }
  }
  roomsList.on('select', itemSelected);

  async function sendMessage() {
    if ('creator' in rooms[currentRoomIndex]) {
      messagesList.addItem("08/10/11 13:33:56 {#0000ff-fg}<barrydalive>{/} " + messageBox.getValue());
      messagesList.setScrollPerc(100);
    }
    messageBox.clearValue();
    screen.render();
  }
  messageBox.key('enter', sendMessage);

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
      statusText.setContent('{red-fg}Unable to load rooms.{/red-fg}')
      throw e;
    }
    screen.render();
  }
  screen.on('show', fetchRooms);

  function formatMessage(message: Message): string {
    let timeSent = new Date(message.timeSent);
    let time = `{#525252-fg}${dateFormat(timeSent, "mm/dd/yy HH:MM:ss")}{/}`;
    let senderName = message.sender.replace(/^\$/g, "");
    let sender = `{#ff0000-fg}<${senderName}>{/}`;
    return `${time} ${sender} ${message.message}`;
  }

  async function renderMessages() {
    messagesList.clearItems();
    messages
      .reverse()
      .map(formatMessage)
      .forEach(msg => messagesList.addItem(msg));
  }

  async function connectToRoom(roomName: string) {
    try {
      statusText.setContent('Connecting to room ' + roomName + '...')
      screen.render();
      messages = await getMessages(roomName);
      await renderMessages();
      messagesList.setScrollPerc(100);
    } catch (e) {
      statusText.setContent('{red-fg}Unable to connect to room.{/red-fg}');
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
  screen.key(['escape', 'q', 'C-c'], exit);

  screen.key('r', () => roomsList.focus());
  screen.key('m', () => messagesList.focus());


  return screen;
}
