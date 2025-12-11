import { PrismaClient, RoomStatus } from '@prisma/client';
// iko sawa
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // 1. Create Providers (Dentists)
  console.log('Creating providers...');
  const provider1 = await prisma.provider.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Smith',
      email: 'sarah.smith@clinic.com',
      phone: '+1234567890',
      speciality: 'General Dentistry',
      licenseNo: 'DEN12345',
      isActive: true,
    },
  });
  console.log(`✅ Created: Dr. ${provider1.firstName} ${provider1.lastName}`);

  const provider2 = await prisma.provider.create({
    data: {
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@clinic.com',
      phone: '+1234567891',
      speciality: 'Orthodontics',
      licenseNo: 'DEN12346',
      isActive: true,
    },
  });
  console.log(`✅ Created: Dr. ${provider2.firstName} ${provider2.lastName}\n`);

  // 2. Create Rooms
  console.log('Creating rooms...');
  const room1 = await prisma.room.create({
    data: {
      name: 'Room 1',
      roomNumber: '101',
      status: RoomStatus.AVAILABLE,
      providerId: provider1.id,
    },
  });
  console.log(`✅ Created: ${room1.name} (${room1.roomNumber}) - Dr. Smith`);

  const room2 = await prisma.room.create({
    data: {
      name: 'Room 2',
      roomNumber: '102',
      status: RoomStatus.AVAILABLE,
      providerId: provider2.id,
    },
  });
  console.log(`✅ Created: ${room2.name} (${room2.roomNumber}) - Dr. Chen`);

  const room3 = await prisma.room.create({
    data: {
      name: 'Room 3',
      roomNumber: '103',
      status: RoomStatus.AVAILABLE,
    },
  });
  console.log(`✅ Created: ${room3.name} (${room3.roomNumber}) - Unassigned\n`);

  // 3. Create Test Patients
  console.log('Creating test patients...');
  const patient1 = await prisma.patient.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567892',
      dateOfBirth: new Date('1985-05-15'),
    },
  });
  console.log(`✅ Created: ${patient1.firstName} ${patient1.lastName}`);

  const patient2 = await prisma.patient.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567893',
      dateOfBirth: new Date('1990-08-22'),
    },
  });
  console.log(`✅ Created: ${patient2.firstName} ${patient2.lastName}`);

  const patient3 = await prisma.patient.create({
    data: {
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      phone: '+1234567894',
      dateOfBirth: new Date('1978-03-10'),
    },
  });
  console.log(`✅ Created: ${patient3.firstName} ${patient3.lastName}\n`);

  console.log('✅ Database seeded successfully!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Ready to test! Go to:');
  console.log('  • Staff Dashboard: http://localhost:5173');
  console.log('  • Booking Portal: http://localhost:5174');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

