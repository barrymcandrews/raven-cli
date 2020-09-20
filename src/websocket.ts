import {getSession} from './auth';
import WebSocket from 'ws';

const websocketEndpoint = 'wss://0iv5xv5rd0.execute-api.us-east-1.amazonaws.com/prod';

let connection: WebSocket;

export async function connect(roomName: string): Promise<WebSocket> {
  const accessToken = (await getSession()).getAccessToken().getJwtToken();
  const wsUrl = `${websocketEndpoint}?` +
    `Room=${encodeURIComponent(roomName)}&` +
    `Authorizer=${accessToken}`;

  if (connection) {
    connection.close();
  }

  connection = new WebSocket(wsUrl);
  return connection;
}

export function close() {
  if (connection) connection.close();
}
