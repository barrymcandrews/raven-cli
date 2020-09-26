import {Auth} from './auth';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://v2gj1wek7f.execute-api.us-east-1.amazonaws.com/prod/v1',
});

api.interceptors.request.use(async (config) => {
  config.headers.Authorization = (await Auth.getSession()).getIdToken().getJwtToken();
  return config;
});

export interface Room {
  name: string;
  creator: string;
  canDelete: boolean;
  status?: 'ready'|'deleting'|'not_ready';
}

export interface Message {
  action: 'message'|'$connect'|'$disconnect'|'$default';
  message: string;
  roomName: string;
  timeSent: number;
  sender: string;
}


export async function getRooms(): Promise<Room[]> {
  return (await api.get('/rooms')).data;
}

export async function getMessages(roomName: string): Promise<Message[]> {
  const encodedRoom = encodeURIComponent(roomName);
  return (await api.get(`/rooms/${encodedRoom}/messages?limit=40`)).data.items;
}

export async function getMessagesBetween(roomName: string, before: number, after: number): Promise<Message[]> {
  const encodedRoom = encodeURIComponent(roomName);
  return (await api.get(`/rooms/${encodedRoom}/messages?before=${before}&after=${after}`)).data.items;
}

export async function sendMessage(roomName: string, message: string) {
  const encodedRoom = encodeURIComponent(roomName);
  return (await api.post(`/rooms/${encodedRoom}/messages`, {
    message: message
  }));
}
