#!/usr/bin/env node

import {ensureConfig} from '../lib/config';
import {Auth} from '../lib';
import {ChatScreen} from './chat';
import {once} from "events";


async function main(): Promise<void> {
  await ensureConfig();

  // Log In
  await Auth.authenticate();

  // Chat
  process.stdin.removeAllListeners('data'); // Prevent inquirer and blessed from fighting
  const chatScreen = await ChatScreen();
  chatScreen.render();
  chatScreen.emit('show');
  await once(chatScreen, 'close');
  chatScreen.destroy();
}

if (require.main === module) {
  main();
}

export {
  main as startTui
}
