import { io } from 'socket.io-client';

import api from './services/api';

export const socket = io(`${api}:4000`);
