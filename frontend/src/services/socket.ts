import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(namespace = '/queue') {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(`${WS_URL}${namespace}`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Room management
  joinPatientRoom(patientId: string) {
    this.socket?.emit('join-patient-room', { patientId });
  }

  joinReceptionRoom() {
    this.socket?.emit('join-reception-room');
  }

  joinDentistRoom(providerId: string) {
    this.socket?.emit('join-dentist-room', { providerId });
  }

  leaveRoom(room: string) {
    this.socket?.emit('leave-room', { room });
  }

  // Event listeners
  onQueueUpdate(callback: (data: any) => void) {
    this.socket?.on('queue-updated', callback);
  }

  onPositionUpdate(callback: (data: any) => void) {
    this.socket?.on('position-updated', callback);
  }

  onPatientCalled(callback: (data: any) => void) {
    this.socket?.on('patient-called', callback);
  }

  onRoomStatusChange(callback: (data: any) => void) {
    this.socket?.on('room-status-changed', callback);
  }

  onNotification(callback: (data: any) => void) {
    this.socket?.on('notification', callback);
  }

  onQueueStats(callback: (data: any) => void) {
    this.socket?.on('queue-stats', callback);
  }

  onSystemAlert(callback: (data: any) => void) {
    this.socket?.on('system-alert', callback);
  }

  // Remove event listeners
  offQueueUpdate(callback: (data: any) => void) {
    this.socket?.off('queue-updated', callback);
  }

  offPositionUpdate(callback: (data: any) => void) {
    this.socket?.off('position-updated', callback);
  }

  offPatientCalled(callback: (data: any) => void) {
    this.socket?.off('patient-called', callback);
  }

  offRoomStatusChange(callback: (data: any) => void) {
    this.socket?.off('room-status-changed', callback);
  }

  offNotification(callback: (data: any) => void) {
    this.socket?.off('notification', callback);
  }

  offQueueStats(callback: (data: any) => void) {
    this.socket?.off('queue-stats', callback);
  }

  offSystemAlert(callback: (data: any) => void) {
    this.socket?.off('system-alert', callback);
  }
}

export const socketService = new SocketService();
export default socketService;

