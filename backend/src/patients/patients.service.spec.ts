import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PatientsService', () => {
  let service: PatientsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    patient: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new patient', async () => {
      const createDto = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        email: 'john@example.com',
      };

      const expectedResult = { id: '1', ...createDto, createdAt: new Date(), updatedAt: new Date() };
      mockPrismaService.patient.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.patient.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of patients', async () => {
      const expectedResult = [
        { id: '1', firstName: 'John', lastName: 'Doe', phone: '+1234567890' },
        { id: '2', firstName: 'Jane', lastName: 'Smith', phone: '+0987654321' },
      ];

      mockPrismaService.patient.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.patient.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a patient by id', async () => {
      const expectedResult = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        appointments: [],
        queueEntries: [],
      };

      mockPrismaService.patient.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.patient.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if patient not found', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      const updateDto = { firstName: 'UpdatedJohn' };
      const expectedResult = {
        id: '1',
        firstName: 'UpdatedJohn',
        lastName: 'Doe',
      };

      mockPrismaService.patient.update.mockResolvedValue(expectedResult);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.patient.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a patient', async () => {
      mockPrismaService.patient.delete.mockResolvedValue({ id: '1' });

      await service.remove('1');

      expect(mockPrismaService.patient.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});

