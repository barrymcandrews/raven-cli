import {
  Widgets,
  screen as Screen,
  form as Form,
  button as Button,
  box as Box,
  textbox as TextBox,
  text as Text
} from 'blessed';
import {logIn} from './auth';

export function LoginScreen(): Widgets.Screen {

  const screen = Screen({
    smartCSR: true,
    autoPadding: true,
  });

  const form = Form({
    parent: screen,
    border: 'line',
    height: 9,
    width: 'half',
    top: 'center',
    left: 'center',
    label: ' {blue-fg}Log In{/blue-fg} ',
    tags: true,
    keys: true,
    vi: true,
  });

  form.on('submit', function (data) {
    screen.render();
  });

  const unBox = Box({
    parent: form,
    border: 'line',
    label: 'Username',
    height: 3,
    top: 0,
  });

  const usernameTextBox = TextBox({
    parent: unBox,
    mouse: true,
    keys: true,
    // underline: 'gray',
    height: 1,
    name: 'username',
    inputOnFocus: true,
  });
  usernameTextBox.focus();

  const pwBox = Box({
    parent: form,
    border: 'line',
    label: 'Password',
    height: 3,
    // shrink: true,
    top: 3
  });

  const passwordTextBox = TextBox({
    parent: pwBox,
    mouse: true,
    keys: true,
    // underline: 'gray',
    height: 1,
    censor: true,
    name: 'password',
    inputOnFocus: true,
  });


  const loginButton = Button({
    parent: form,
    mouse: true,
    keys: true,
    shrink: true,
    // border: 'bg',
    padding: {
      left: 1,
      right: 1
    },
    left: 2,
    top: 6,
    name: 'submit',
    content: 'Log In',
    style: {
      bg: 'blue',
      focus: {
        bg: 'cyan',
        fg: 'black',
      },
      hover: {
        bg: 'cyan',
        fg: 'black',
      }
    }
  });

  const cancelButton = Button({
    parent: form,
    mouse: true,
    keys: true,
    shrink: true,

    // border: 'bg',
    padding: {
      left: 1,
      right: 1
    },
    left: 13,
    top: 6,
    name: 'submit',
    content: 'Cancel',
    style: {
      bg: 'blue',
      focus: {
        bg: 'cyan',
        fg: 'black',
      },
      hover: {
        bg: 'cyan',
        fg: 'black',
      }
    }
  });

  const statusText = Text({
    parent: screen,
    bottom: 0,
    left: 0,
    content: 'Ready',
    tags: true
  });

  loginButton.on('press', async function () {
    try {
      statusText.setContent('Logging In...');
      screen.render();
      await logIn({
        username: usernameTextBox.getValue(),
        password: passwordTextBox.getValue()
      });
      statusText.setContent('Success!');
      screen.render();
      screen.emit('close');
    } catch (e) {
      statusText.setContent('{red-fg}Authentication Error: ' + e.message + '{/red-fg}');
      screen.render();
    }
  });

  cancelButton.on('press', () => {
    process.exit(0);
  })


  screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
  });

  return screen;
}
