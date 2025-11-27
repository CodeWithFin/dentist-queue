import api from './api';

export interface QueueEntry {
  id: string;
  patientId: string;
  appointmentId?: string;
  roomId?: string;
  priority: 'EMERGENCY' | 'URGENT' | 'APPOINTMENT' | 'NORMAL';
  status: 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED';
  queueNumber: number;
  position: number;
  estimatedWait?: number;
  reason: string;
  notes?: string;
  checkedInAt: string;
  calledAt?: string;
  startedAt?: string;
  completedAt?: string;
  patient?: any;
  appointment?: any;
  room?: any;
}

export interface CheckInDto {
  patientId: string;
  appointmentId?: string;
  priority: 'EMERGENCY' | 'URGENT' | 'APPOINTMENT' | 'NORMAL';
  reason: string;
  notes?: string;
}

export interface QueueStats {
  currentQueueSize: number;
  todayStats: any[];
  averageWaitTime: number;
}

export const queueService = {
  async checkIn(data: CheckInDto): Promise<QueueEntry> {
    const response = await api.post('/queue/check-in', data);
    return response.data;
  },

  async getCurrentQueue(): Promise<QueueEntry[]> {
    const response = await api.get('/queue');
    return response.data;
  },

  async getById(id: string): Promise<QueueEntry> {
    const response = await api.get(`/queue/${id}`);
    return response.data;
  },

  async getPatientPosition(patientId: string): Promise<any> {
    const response = await api.get(`/queue/patient/${patientId}/position`);
    return response.data;
  },

  async getStats(): Promise<QueueStats> {
    const response = await api.get('/queue/stats');
    return response.data;
  },

  async callNext(id: string, roomId: string): Promise<QueueEntry> {
    const response = await api.patch(`/queue/${id}/call-next`, { roomId });
    return response.data;
  },

  async startService(id: string): Promise<QueueEntry> {
    const response = await api.patch(`/queue/${id}/start-service`);
    return response.data;
  },

  async complete(id: string): Promise<QueueEntry> {
    const response = await api.patch(`/queue/${id}/complete`);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<QueueEntry> {
    const response = await api.patch(`/queue/${id}/status`, { status });
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/queue/${id}`);
  },

  async checkInAppointment(appointmentId: string, patientId: string, reason: string): Promise<any> {
    const response = await api.post('/queue/check-in', {
      patientId,
      appointmentId,
      priority: 'APPOINTMENT', // Priority 3 - higher than walk-ins (Priority 4)
      reason,
    });
    return response.data;
  },
};

export default queueService;

