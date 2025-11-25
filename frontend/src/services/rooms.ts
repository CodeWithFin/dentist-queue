import api from './api';

export interface Room {
  id: string;
  roomNumber: string;
  name: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  providerId?: string;
  provider?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomDto {
  roomNumber: string;
  name: string;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  providerId?: string;
}

export const roomsService = {
  async getAll(): Promise<Room[]> {
    const response = await api.get('/rooms');
    return response.data;
  },

  async getAvailable(): Promise<Room[]> {
    const response = await api.get('/rooms/available');
    return response.data;
  },

  async getById(id: string): Promise<Room> {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  async create(data: CreateRoomDto): Promise<Room> {
    const response = await api.post('/rooms', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateRoomDto>): Promise<Room> {
    const response = await api.put(`/rooms/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<Room> {
    const response = await api.patch(`/rooms/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/rooms/${id}`);
  },
};

export default roomsService;

