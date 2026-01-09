import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../lib/mongodb';
import User from '../lib/models/User';
import Agent from '../lib/models/Agent';

async function seed() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing users and agents...');
    await User.deleteMany({});
    await Agent.deleteMany({});
    console.log('✅ Cleared existing data');

    console.log('📊 Creating test users and agents...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    });
    console.log('👤 Created admin user: admin@example.com / admin123');

    // Create test clients
    const client1Password = await bcrypt.hash('client123', 10);
    const client1 = await User.create({
      name: 'Client One',
      email: 'client1@example.com',
      password: client1Password,
      role: 'client',
    });

    const client2Password = await bcrypt.hash('client123', 10);
    const client2 = await User.create({
      name: 'Client Two',
      email: 'client2@example.com',
      password: client2Password,
      role: 'client',
    });

    const client3Password = await bcrypt.hash('client123', 10);
    const client3 = await User.create({
      name: 'Client Three',
      email: 'client3@example.com',
      password: client3Password,
      role: 'client',
    });

    console.log('👤 Created test clients (password: client123):');
    console.log('   - client1@example.com');
    console.log('   - client2@example.com');
    console.log('   - client3@example.com');

    // Note: Admin doesn't need specific agents assigned
    // Admin role automatically gets access to ALL agents

    // Create agents for clients
    // Client 1 - 1 bot (real agent ID)
    await Agent.create({
      name: 'Sales Bot',
      bolnaAgentId: '9e9d6e88-f57b-4f5a-82cb-573d16dbf108',
      description: 'Handles sales inquiries',
      color: '#3B82F6',
      userId: client1._id,
    });

    // Client 2 - 2 bots (one real from .env, one fake)
    const realAgentId = process.env.BOLNA_AGENT_ID;
    await Agent.create([
      {
        name: 'Support Bot',
        bolnaAgentId: realAgentId || 'agent-002',
        description: 'Customer support assistant',
        color: '#10B981',
        userId: client2._id,
      },
      {
        name: 'Marketing Bot',
        bolnaAgentId: 'agent-003',
        description: 'Marketing campaigns',
        color: '#F59E0B',
        userId: client2._id,
      },
    ]);

    // Client 3 - 3 bots
    await Agent.create([
      {
        name: 'Lead Gen Bot',
        bolnaAgentId: 'agent-004',
        description: 'Lead generation',
        color: '#8B5CF6',
        userId: client3._id,
      },
      {
        name: 'Appointment Bot',
        bolnaAgentId: 'agent-005',
        description: 'Appointment scheduling',
        color: '#EC4899',
        userId: client3._id,
      },
      {
        name: 'Survey Bot',
        bolnaAgentId: 'agent-006',
        description: 'Customer surveys',
        color: '#06B6D4',
        userId: client3._id,
      },
    ]);

    console.log('🤖 Created test agents for each client');
    console.log('   - Client 1: 1 bot');
    console.log('   - Client 2: 2 bots');
    console.log('   - Client 3: 3 bots');

    console.log('\n✨ Seed completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin@example.com / admin123 (can see ALL agents)');
    console.log('Client 1: client1@example.com / client123 (1 bot - real agent)');
    console.log('Client 2: client2@example.com / client123 (2 bots - 1 real, 1 fake)');
    console.log('Client 3: client3@example.com / client123 (3 bots - all fake)');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
