/**
 * SalonFlow — Database Seeder
 * Seeds the database with sample data for demo purposes.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Service = require('./models/Service');
const Staff = require('./models/Staff');
const Inventory = require('./models/Inventory');

const seedData = async () => {
  try {
    await connectDB();
    console.log('🗑️  Clearing existing data...');

    await User.deleteMany({});
    await Service.deleteMany({});
    await Staff.deleteMany({});
    await Inventory.deleteMany({});

    // ─── Create Users ─────────────────────────────────────
    console.log('👤 Creating users...');
    const admin = await User.create({
      name: 'Priya Sharma',
      email: 'admin@salonflow.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 9876543210',
    });

    const staffUsers = await User.create([
      { name: 'Riya Patel', email: 'riya@salonflow.com', password: 'staff123', role: 'staff', phone: '+91 9876543211' },
      { name: 'Amit Kumar', email: 'amit@salonflow.com', password: 'staff123', role: 'staff', phone: '+91 9876543212' },
      { name: 'Neha Singh', email: 'neha@salonflow.com', password: 'staff123', role: 'staff', phone: '+91 9876543213' },
      { name: 'Vikram Reddy', email: 'vikram@salonflow.com', password: 'staff123', role: 'staff', phone: '+91 9876543214' },
    ]);

    const customer = await User.create({
      name: 'Ananya Gupta',
      email: 'customer@salonflow.com',
      password: 'customer123',
      role: 'customer',
      phone: '+91 9876543215',
    });

    // ─── Create Staff Profiles ────────────────────────────
    console.log('💇 Creating staff profiles...');
    const staffProfiles = await Staff.create([
      {
        userId: staffUsers[0]._id,
        specializations: ['Haircut', 'Hair Color', 'Hair Treatment'],
        bio: 'Senior stylist with 8 years of experience in modern cuts and coloring techniques.',
        experience: 8,
        rating: { average: 4.8, count: 45 },
        completedAppointments: 312,
      },
      {
        userId: staffUsers[1]._id,
        specializations: ['Facial', 'Skin Care', 'Massage'],
        bio: 'Certified esthetician specializing in facial treatments and skin rejuvenation.',
        experience: 5,
        rating: { average: 4.6, count: 38 },
        completedAppointments: 245,
      },
      {
        userId: staffUsers[2]._id,
        specializations: ['Makeup', 'Bridal', 'Manicure', 'Pedicure'],
        bio: 'Professional makeup artist with expertise in bridal and occasion makeup.',
        experience: 6,
        rating: { average: 4.9, count: 52 },
        completedAppointments: 389,
      },
      {
        userId: staffUsers[3]._id,
        specializations: ['Haircut', 'Waxing', 'Massage'],
        bio: 'Versatile grooming specialist with a focus on mens styling and relaxation therapies.',
        experience: 4,
        rating: { average: 4.5, count: 29 },
        completedAppointments: 198,
      },
    ]);

    // ─── Create Services ──────────────────────────────────
    console.log('✂️  Creating services...');
    await Service.create([
      { name: 'Classic Haircut', category: 'Haircut', description: 'Professional haircut with wash, style, and blow dry', duration: 45, price: 500, popularity: 156 },
      { name: 'Premium Haircut & Styling', category: 'Haircut', description: 'Premium cut with deep conditioning, styling, and personalized consultation', duration: 60, price: 1200, popularity: 89 },
      { name: 'Kids Haircut', category: 'Haircut', description: 'Fun and gentle haircut for children under 12', duration: 30, price: 300, popularity: 67 },
      { name: 'Global Hair Color', category: 'Hair Color', description: 'Full head color with premium ammonia-free products', duration: 120, price: 3500, popularity: 94 },
      { name: 'Highlights & Balayage', category: 'Hair Color', description: 'Natural-looking highlights with hand-painted balayage technique', duration: 150, price: 4500, popularity: 78 },
      { name: 'Keratin Treatment', category: 'Hair Treatment', description: 'Professional keratin smoothing treatment for frizz-free hair', duration: 180, price: 5000, popularity: 65 },
      { name: 'Hair Spa', category: 'Hair Treatment', description: 'Deep conditioning spa treatment with hot oil massage', duration: 60, price: 1200, popularity: 112 },
      { name: 'Gold Facial', category: 'Facial', description: 'Luxurious gold-infused facial for radiant glowing skin', duration: 60, price: 1500, popularity: 88 },
      { name: 'Anti-Aging Facial', category: 'Facial', description: 'Advanced anti-aging treatment with collagen boost', duration: 75, price: 2000, popularity: 54 },
      { name: 'Hydrating Facial', category: 'Facial', description: 'Deep hydration facial for dry and dull skin', duration: 50, price: 800, popularity: 76 },
      { name: 'Classic Manicure', category: 'Manicure', description: 'Nail shaping, cuticle care, and polish application', duration: 30, price: 400, popularity: 98 },
      { name: 'Gel Manicure', category: 'Manicure', description: 'Long-lasting gel polish manicure with nail art options', duration: 45, price: 700, popularity: 72 },
      { name: 'Spa Pedicure', category: 'Pedicure', description: 'Relaxing foot spa with exfoliation, massage, and polish', duration: 45, price: 600, popularity: 84 },
      { name: 'Bridal Makeup', category: 'Makeup', description: 'Complete bridal makeup with HD products and airbrush technique', duration: 120, price: 8000, popularity: 45 },
      { name: 'Party Makeup', category: 'Makeup', description: 'Glamorous party look with professional products', duration: 60, price: 2500, popularity: 63 },
      { name: 'Full Body Waxing', category: 'Waxing', description: 'Complete body waxing with premium hypoallergenic wax', duration: 90, price: 1500, popularity: 91 },
      { name: 'Swedish Massage', category: 'Massage', description: 'Relaxing full-body Swedish massage for stress relief', duration: 60, price: 1500, popularity: 73 },
      { name: 'Deep Tissue Massage', category: 'Massage', description: 'Therapeutic deep tissue massage for muscle tension', duration: 60, price: 2000, popularity: 58 },
      { name: 'Bridal Package', category: 'Bridal', description: 'Complete bridal package: makeup, hair, manicure, pedicure, and facial', duration: 300, price: 25000, popularity: 32 },
    ]);

    // ─── Create Inventory ─────────────────────────────────
    console.log('📦 Creating inventory...');
    await Inventory.create([
      { name: "L'Oreal Shampoo 500ml", category: 'Hair Products', quantity: 25, unit: 'bottles', reorderLevel: 5, costPrice: 450, sellingPrice: 750, supplier: { name: "L'Oreal India", contact: '+91 1800123456' } },
      { name: 'Schwarzkopf Hair Color', category: 'Hair Products', quantity: 30, unit: 'packets', reorderLevel: 10, costPrice: 600, sellingPrice: 0, supplier: { name: 'Schwarzkopf', contact: '+91 1800789012' } },
      { name: 'Wax Strips', category: 'Consumables', quantity: 50, unit: 'boxes', reorderLevel: 15, costPrice: 200, sellingPrice: 0, supplier: { name: 'Beauty Supplies Co', contact: '+91 9811111111' } },
      { name: 'Facial Cream - Gold', category: 'Skin Products', quantity: 12, unit: 'bottles', reorderLevel: 3, costPrice: 800, sellingPrice: 1200, supplier: { name: 'VLCC', contact: '+91 9822222222' } },
      { name: 'Nail Polish Set', category: 'Tools', quantity: 3, unit: 'boxes', reorderLevel: 5, costPrice: 1500, sellingPrice: 0, supplier: { name: 'Nailart Pro', contact: '+91 9833333333' } },
      { name: 'Massage Oil - Lavender', category: 'Skin Products', quantity: 8, unit: 'liters', reorderLevel: 3, costPrice: 350, sellingPrice: 550, supplier: { name: 'Aroma Essentials', contact: '+91 9844444444' } },
      { name: 'Disposable Towels', category: 'Consumables', quantity: 100, unit: 'packets', reorderLevel: 20, costPrice: 150, sellingPrice: 0, supplier: { name: 'HygiCare', contact: '+91 9855555555' } },
      { name: 'Hair Dryer Professional', category: 'Tools', quantity: 4, unit: 'pieces', reorderLevel: 2, costPrice: 3500, sellingPrice: 0, supplier: { name: 'Philips India', contact: '+91 1800555555' } },
    ]);

    // ─── Create Sample Appointments ─────────────────────────
    console.log('📅 Creating sample appointments...');
    const Appointment = require('./models/Appointment');
    await Appointment.deleteMany({});
    const allServices = await Service.find({});

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 5);

    await Appointment.create([
      // Appointments for Riya (staffProfiles[0])
      {
        customer: customer._id, staff: staffProfiles[0]._id,
        services: [allServices[0]._id],
        date: today, timeSlot: { start: '10:00', end: '10:45' },
        totalDuration: 45, totalAmount: 500, status: 'pending', bookedVia: 'web',
      },
      {
        customer: customer._id, staff: staffProfiles[0]._id,
        services: [allServices[1]._id],
        date: today, timeSlot: { start: '14:00', end: '15:00' },
        totalDuration: 60, totalAmount: 1200, status: 'confirmed', bookedVia: 'web',
      },
      {
        customer: customer._id, staff: staffProfiles[0]._id,
        services: [allServices[0]._id, allServices[1]._id],
        date: tomorrow, timeSlot: { start: '11:00', end: '12:45' },
        totalDuration: 105, totalAmount: 1700, status: 'pending', bookedVia: 'web',
      },
      {
        customer: customer._id, staff: staffProfiles[0]._id,
        services: [allServices[6]._id],
        date: dayAfter, timeSlot: { start: '09:00', end: '10:00' },
        totalDuration: 60, totalAmount: 1200, status: 'pending', bookedVia: 'web',
      },
      // Appointments for Amit (staffProfiles[1])
      {
        customer: customer._id, staff: staffProfiles[1]._id,
        services: [allServices[7]._id],
        date: today, timeSlot: { start: '10:00', end: '11:00' },
        totalDuration: 60, totalAmount: 1500, status: 'confirmed', bookedVia: 'web',
      },
      {
        customer: customer._id, staff: staffProfiles[1]._id,
        services: [allServices[8]._id],
        date: tomorrow, timeSlot: { start: '15:00', end: '16:15' },
        totalDuration: 75, totalAmount: 2000, status: 'pending', bookedVia: 'web',
      },
      // Appointments for Neha (staffProfiles[2])
      {
        customer: customer._id, staff: staffProfiles[2]._id,
        services: [allServices[13]._id],
        date: dayAfter, timeSlot: { start: '10:00', end: '12:00' },
        totalDuration: 120, totalAmount: 8000, status: 'confirmed', bookedVia: 'web',
      },
      {
        customer: customer._id, staff: staffProfiles[2]._id,
        services: [allServices[10]._id, allServices[12]._id],
        date: nextWeek, timeSlot: { start: '14:00', end: '15:15' },
        totalDuration: 75, totalAmount: 1000, status: 'pending', bookedVia: 'web',
      },
      // Appointments for Vikram (staffProfiles[3])
      {
        customer: customer._id, staff: staffProfiles[3]._id,
        services: [allServices[0]._id],
        date: today, timeSlot: { start: '11:00', end: '11:45' },
        totalDuration: 45, totalAmount: 500, status: 'in-progress', bookedVia: 'web',
      },
      {
        customer: customer._id, staff: staffProfiles[3]._id,
        services: [allServices[16]._id],
        date: tomorrow, timeSlot: { start: '16:00', end: '17:00' },
        totalDuration: 60, totalAmount: 1500, status: 'pending', bookedVia: 'web',
      },
    ]);

    console.log('\n✅ Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Admin: admin@salonflow.com / admin123');
    console.log('📧 Staff: riya@salonflow.com / staff123');
    console.log('📧 Customer: customer@salonflow.com / customer123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
