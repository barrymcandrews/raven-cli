# Raven CLI
**See Also:** &nbsp;&nbsp;&nbsp;&nbsp;&#127959; [AWS Infrastructure](https://github.com/barrymcandrews/raven-iac)&nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;&nbsp;🖼️ [React Frontend](https://github.com/barrymcandrews/raven-react)&nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;&nbsp; 🚀[React Frontend Demo](https://raven.bmcandrews.com)



## About The Project
Raven Messenger is a proof-of-concept serverless chat application. This project provides a way to consume the Raven Web APIs from the command line.

### Text-based User Interface (TUI)

<img src="docs/raven-cli.png" width="600">

The text-based user interface lets you browse and send messages like you would in a web browser. 

### Command Line Interface (CLI) 
*_Under Construction_ *

The goal of the CLI is to provide programmatic access to Raven's messages and rooms. This is geared towards making it easier to integrate a chatbot into the platform.

```
raven <subcommand> [parameters]
```

#### Available Subcommands

* `chat`
* `configure`
* `auth` 
* `send-message`

 
## Getting Started
Before using this project you'll need to create an account using the [React Frontend](https://github.com/barrymcandrews/raven-react). 

### Installation

Install the application by using the node package manager of your choice:

```
$ npm install -g @bmcandrews/raven-cli
```

Once installed, start the TUI by running the `raven` command:  

```
$ raven
```

### Building from Source

To set up the project, clone the repository and install the dependencies.


```
$ git clone https://github.com/barrymcandrews/raven-cli
$ cd raven-cli
$ yarn install
```

#### Usage

 * `yarn run build`  compile TypeScript to JavaScript
 * `yarn run start`  run the app in development mode
 * `yarn run local`  install the app globally, then run the app



## CLI Subcommands

### chat
Starts the Raven TUI. 

```
raven chat
```

### configure
Configures connection settings and saves them to the `.raven` file. This opens an interactive prompt with questions for the user. The default settings will connect the user to my instance of the Raven backend.

```
raven configure
```



### auth
Attempts to authenticate with the Raven backend. First it tries to use the tokens stored in the `.raven` file. If the CLI finds no tokens, it will prompt the user for a username and password. Once authenticated, all tokens will be saved to the `.raven` file. This allows a user to make subsequent calls to the API without having to enter a username and password every time.

```
raven auth [-u --user]
```
##### Example 
```
$ raven auth | jq
{
  "accessToken": "[ACCESS_TOKEN]",
  "idToken": "[ID_TOKEN]",
  "refreshToken": "[REFRESH_TOKEN]",
  "username": "barrydalive"
}
```

### send-message
Sends a message to a chat room. 

```
raven send-message [--room room-name] [--message message]
```
##### Example 
```
$ raven send-message --room my-fun-room --message "What's up?"
```


## Contact

Barry McAndrews - bmcandrews@pitt.edu

Project Link: [https://github.com/barrymcandrews/raven-cli](https://github.com/barrymcandrews/raven-cli)
