import { io } from 'socket.io-client';

function getSocketServerUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Strip trailing /api or slash to get the server root
  return configuredUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
}

export const socket = io(getSocketServerUrl(), {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1500,
  transports: ['websocket', 'polling'],
});

export function joinAdminRoom() {
  if (socket.connected) {
    socket.emit('join:admin');
  } else {
    socket.once('connect', () => {
      socket.emit('join:admin');
    });
  }
}

export function joinOrderRoom(orderId) {
  if (!orderId) return;
  if (socket.connected) {
    socket.emit('join:order', orderId);
  } else {
    socket.once('connect', () => {
      socket.emit('join:order', orderId);
    });
  }
}

export function leaveOrderRoom(orderId) {
  if (!orderId) return;
  socket.emit('leave:order', orderId);
}
