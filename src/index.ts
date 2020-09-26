#!/usr/bin/env node

import {Auth, Api} from './lib';
import yargs from 'yargs';
import {startTui} from './tui';


interface SendMessageArgs {
  room: string,
  message: string
}

process.on('unhandledRejection', error => {
  console.log(error);
  process.exit(-1);
});

yargs
  .command('$0', 'default', startTui)
  .command('chat', 'chat', startTui)
  .command('auth', 'auth', async () => {
    let session = await Auth.authenticate();
    console.log(JSON.stringify({
      accessToken: session.getAccessToken().getJwtToken(),
      idToken: session.getIdToken().getJwtToken(),
      refreshToken: session.getRefreshToken().getToken(),
      username: session.getAccessToken().payload.username,
    }));
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


