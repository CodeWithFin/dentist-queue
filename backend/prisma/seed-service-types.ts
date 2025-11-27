import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedServiceTypes() {
  console.log('Seeding service types...');

  const serviceTypes = [
    {
      name: 'Regular Checkup',
      description: 'Routine dental examination and cleaning',
      estimatedDuration: 30,
      requiresAssistant: false,
    },
    {
      name: 'Cleaning',
      description: 'Professional teeth cleaning and scaling',
      estimatedDuration: 45,
      requiresAssistant: true,
    },
    {
      name: 'Filling',
      description: 'Tooth cavity filling procedure',
      estimatedDuration: 60,
      requiresAssistant: true,
    },
    {
      name: 'Extraction',
      description: 'Tooth removal procedure',
      estimatedDuration: 45,
      requiresAssistant: true,
    },
    {
      name: 'Root Canal',
      description: 'Root canal treatment',
      estimatedDuration: 90,
      requiresAssistant: true,
    },
    {
      name: 'Crown',
      description: 'Dental crown placement',
      estimatedDuration: 120,
      requiresAssistant: true,
    },
    {
      name: 'Emergency',
      description: 'Emergency dental treatment',
      estimatedDuration: 30,
      requiresAssistant: true,
    },
    {
      name: 'Consultation',
      description: 'Initial consultation or follow-up',
      estimatedDuration: 20,
      requiresAssistant: false,
    },
  ];

  for (const serviceType of serviceTypes) {
    await prisma.serviceType.upsert({
      where: { name: serviceType.name },
      update: serviceType,
      create: serviceType,
    });
    console.log(`✅ Service type: ${serviceType.name}`);
  }

  console.log('Service types seeded successfully!');
}

seedServiceTypes()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

