/**
 * SalonFlow — Analytics Controller
 */
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Service = require('../models/Service');

const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Total counts
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalAppointments = await Appointment.countDocuments();
    const monthlyAppointments = await Appointment.countDocuments({
      createdAt: { $gte: startOfMonth },
    });
    const todaysAppointments = await Appointment.countDocuments({
      date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    // Revenue
    const revenueData = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Popular services
    const popularServices = await Service.find({ isActive: true })
      .sort({ popularity: -1 })
      .limit(5)
      .select('name category popularity price');

    // Monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueTrend = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Appointment status distribution
    const statusDistribution = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          totalAppointments,
          monthlyAppointments,
          todaysAppointments,
          totalRevenue,
          monthlyRevenue: monthlyRevenue[0]?.total || 0,
        },
        popularServices,
        revenueTrend,
        statusDistribution,
      },
    });
  } catch (error) { next(error); }
};

module.exports = { getDashboardStats };
