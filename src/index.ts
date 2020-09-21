#!/usr/bin/env node

import {once} from 'events';
import {ChatScreen} from './chat';
import {logIn} from './auth';
import inquirer from 'inquirer';

async function main(): Promise<number> {
  // Log In
  let answers = await inquirer.prompt([
    {
      name: 'username',
      message: 'What is your username?',
    },
    {
      name: 'password',
      message: 'What is your password?',
      type: 'password'
    },
  ]);

  try {
    await logIn(answers);
  } catch (e) {
    console.log('An error occurred: ' + e.message);
    process.exit(1);
  }


  // Chat
  process.stdin.removeAllListeners('data'); // Prevent inquirer and blessed from fighting
  const chatScreen = await ChatScreen();
  chatScreen.render();
  chatScreen.emit('show');
  await once(chatScreen, 'close');
  chatScreen.destroy();

  return 0;
}

main().then(process.exit);
