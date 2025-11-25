import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/queue',
})
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('QueueGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-patient-room')
  handleJoinPatientRoom(
    @MessageBody() data: { patientId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `patient:${data.patientId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { event: 'joined-room', data: { room } };
  }

  @SubscribeMessage('join-reception-room')
  handleJoinReceptionRoom(@ConnectedSocket() client: Socket) {
    client.join('reception');
    this.logger.log(`Client ${client.id} joined reception room`);
    return { event: 'joined-room', data: { room: 'reception' } };
  }

  @SubscribeMessage('join-dentist-room')
  handleJoinDentistRoom(
    @MessageBody() data: { providerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `dentist:${data.providerId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { event: 'joined-room', data: { room } };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    client.leave(data.room);
    this.logger.log(`Client ${client.id} left room: ${data.room}`);
    return { event: 'left-room', data: { room: data.room } };
  }

  // Emit events to specific rooms
  emitQueueUpdate(queueData: any) {
    this.server.to('reception').emit('queue-updated', queueData);
    this.logger.log('Queue update emitted to reception');
  }

  emitPatientPositionUpdate(patientId: string, data: any) {
    const room = `patient:${patientId}`;
    this.server.to(room).emit('position-updated', data);
    this.logger.log(`Position update emitted to patient: ${patientId}`);
  }

  emitPatientCalled(patientId: string, data: any) {
    const room = `patient:${patientId}`;
    this.server.to(room).emit('patient-called', data);
    this.server.to('reception').emit('patient-called', data);
    this.logger.log(`Patient called notification sent to: ${patientId}`);
  }

  emitRoomStatusChange(roomData: any) {
    this.server.to('reception').emit('room-status-changed', roomData);
    this.logger.log('Room status change emitted');
  }

  emitNotification(patientId: string, notification: any) {
    const room = `patient:${patientId}`;
    this.server.to(room).emit('notification', notification);
    this.logger.log(`Notification sent to patient: ${patientId}`);
  }

  emitSystemAlert(message: string) {
    this.server.emit('system-alert', { message, timestamp: new Date() });
    this.logger.log('System alert emitted to all clients');
  }

  // Broadcast to all connected clients
  broadcastQueueStats(stats: any) {
    this.server.emit('queue-stats', stats);
    this.logger.log('Queue stats broadcasted');
  }
}

