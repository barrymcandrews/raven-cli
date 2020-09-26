#!/usr/bin/env node

import {once} from 'events';
import {ChatScreen} from './chat';
import {Auth} from './auth';
import * as Api from './api'
import yargs from 'yargs';
import {ensureConfig} from './config';


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

interface SendMessageArgs {
  room: string,
  message: string
}

process.on('unhandledRejection', error => {
  console.log(error);
  process.exit(-1);
});

yargs
  .command('$0', 'default', main)
  .command('chat', 'chat', main)
  .command('auth', 'auth', async () => {
    console.log(JSON.stringify(await Auth.authenticate()));
  })
  .command<SendMessageArgs>({
    command: 'send-message',
    describe: 'send message',
    handler: async args => {
      await Auth.authenticate();
      await Api.sendMessage(args.room, args.message);
    }
  })
  .argv


