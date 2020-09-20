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

  // Chat
  try {
    await logIn(answers);
  } catch (e) {
    console.log('An error occurred: ' + e.message);
    process.exit(1);
  }

  const chatScreen = await ChatScreen();
  chatScreen.render();
  chatScreen.emit('show');
  await once(chatScreen, 'close');
  chatScreen.destroy();

  return 0;
}

main().then(process.exit);
