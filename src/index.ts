import {LoginScreen} from './login';
import {once} from 'events';
import {ChatScreen} from './chat';
import {logIn} from './auth';
import {getRooms} from './api';

async function main(): Promise<number> {
  // Log In
  // const logInScreen = LoginScreen();
  // logInScreen.render();
  // await once(logInScreen, 'close');
  // logInScreen.destroy();

  // Chat
  await logIn({
    username: 'barrydalive',
    password: '***REMOVED***'
  });
  const chatScreen = ChatScreen();
  chatScreen.render();
  chatScreen.emit('show');
  await once(chatScreen, 'close');
  chatScreen.destroy();

  return 0;
}

main().then(process.exit);
