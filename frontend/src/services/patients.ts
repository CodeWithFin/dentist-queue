import api from './api';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  notes?: string;
}

export const patientsService = {
  async getAll(): Promise<Patient[]> {
    const response = await api.get('/patients');
    return response.data;
  },

  async getById(id: string): Promise<Patient> {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  async getByPhone(phone: string): Promise<Patient> {
    const response = await api.get(`/patients/phone/${phone}`);
    return response.data;
  },

  async create(data: CreatePatientDto): Promise<Patient> {
    const response = await api.post('/patients', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreatePatientDto>): Promise<Patient> {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/patients/${id}`);
  },

  async search(query: string): Promise<Patient[]> {
    const response = await api.get('/patients', { params: { search: query } });
    return response.data;
  },
};

export default patientsService;

