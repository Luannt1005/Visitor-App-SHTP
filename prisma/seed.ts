import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialRooms = [
    // Common Office
    { category: 'Common Office', name: 'Share Function Office L6M' },
    { category: 'Common Office', name: 'MIL Office L6M' },
    { category: 'Common Office', name: 'Share Function Office L4M' },
    { category: 'Common Office', name: 'MIL Office L4M' },

    // AME Areas
    { category: 'AME', name: 'AME Office L4M' },
    { category: 'AME', name: 'AME Workshop L5F' },

    // ENG Areas
    { category: 'ENG', name: 'ENG Office L2M' },
    { category: 'ENG', name: 'ENG Office L4M' },
    { category: 'ENG', name: 'Test Lab Entrance' },

    // EE/Motor Team
    { category: 'EE/MT', name: 'EE/MT ENG Areas L2M' },

    // Manufacturing Team
    { category: 'MFG', name: 'Level 3: Production Office L3F - PM Workshop L3F' },
    { category: 'MFG', name: 'Level 5: Production Office L5F - PM Workshop L5F' },

    // Shipping Office
    { category: 'Shipping', name: 'Shipping Office L1' },

    // Quality Areas
    { category: 'Quality QM', name: 'QM Office L6M' },
    { category: 'Quality QM', name: 'MET/IQC Office L1M' },
];

async function main() {
    console.log('Start seeding dynamic rooms...');
    for (const room of initialRooms) {
        // Upsert to ensure we don't duplicate on re-runs
        await prisma.roomArea.create({
            data: room,
        });
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
