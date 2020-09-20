import {getSession} from './auth';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://v2gj1wek7f.execute-api.us-east-1.amazonaws.com/prod/v1',
});

api.interceptors.request.use(async (config) => {
  config.headers.Authorization = (await getSession()).getIdToken().getJwtToken();
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

export async function getMessages(roomName: string, before = Date.now()): Promise<Message[]> {
  const encodedRoom = encodeURIComponent(roomName);
  return (await api.get(`/rooms/${encodedRoom}/messages?limit=40`)).data.items;
}
