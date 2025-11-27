import api from './api';

export interface Appointment {
  id: string;
  patientId: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  providerId: string;
  provider: {
    id: string;
    firstName: string;
    lastName: string;
    speciality?: string;
  };
  scheduledTime: string;
  duration: number;
  reason: string;
  notes?: string;
  status: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  queueEntry?: any;
}

export const appointmentsService = {
  async getAll(filters?: {
    patientId?: string;
    providerId?: string;
    status?: string;
    date?: string;
  }): Promise<Appointment[]> {
    const response = await api.get('/appointments', { params: filters });
    return response.data;
  },

  async getToday(): Promise<Appointment[]> {
    const response = await api.get('/appointments/today');
    return response.data;
  },

  async getById(id: string): Promise<Appointment> {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  async create(data: any): Promise<Appointment> {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  async update(id: string, data: any): Promise<Appointment> {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<Appointment> {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  async cancel(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },
};

export default appointmentsService;

