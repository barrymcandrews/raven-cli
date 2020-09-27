#!/usr/bin/env node

import {Auth, Api} from './lib';
import yargs, {Options} from 'yargs';
import {startTui} from './tui';
import {createConfig} from './lib/config';


process.on('unhandledRejection', error => {
  console.log(error);
  process.exit(-1);
});

// Shared Options
const forceUser: Options = {
  alias: 'user',
  describe: 'force login method to username and password',
  type: 'boolean',
};


// Chat
yargs
  .command(['$0', 'chat'], 'Start the raven chat TUI.', startTui);


// Configure
yargs
  .command({
    command: 'configure',
    describe: 'Configure the raven CLI options.',
    handler: async () => await createConfig()
  });


// Auth
yargs
  .command({
    command: 'auth',
    describe: 'Log in to the raven server and save the credentials.',
    builder: yargs => yargs.options({
      'u': forceUser
    }),
    handler: async (args) => {
      let session = await Auth.authenticate(!args.user as boolean);
      console.log(JSON.stringify({
        accessToken: session.getAccessToken().getJwtToken(),
        idToken: session.getIdToken().getJwtToken(),
        refreshToken: session.getRefreshToken().getToken(),
        username: session.getAccessToken().payload.username,
      }));
    }
  });


// Send Message
yargs
  .command({
    command: 'send-message',
    describe: 'Send a message to the raven server.',
    builder: (yargs) => yargs.options({
      'u': forceUser,
      'r': {
        alias: ['room-name', 'room'],
        demandOption: true,
        type: 'string',
      },
      'm': {
        alias: 'message',
        demandOption: true,
        type: 'string',
      }
    }),
    handler: async args => {
      await Auth.authenticate(!args.user as boolean);
      await Api.sendMessage(args.roomName as string, args.message as string);
    }
  });


yargs
  .strict()
  .argv


