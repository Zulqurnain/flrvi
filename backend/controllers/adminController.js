const pb = require('../db/pocketbase');

const getAllUsers = async (req, res) => {
  try {
    const users = await pb.collection('users').getFullList({
      filter: 'id != ""', // Fetch all users
      fields: '-password' // Exclude password field (PocketBase handles this automatically for public views, but good practice)
    });
    res.json(users.map(user => {
      const { password, ...rest } = user; // Destructure to exclude password
      return rest;
    }));
  } catch (err) {
    console.error(err.message);
    res.status(500).send(req.t('server_error'));
  }
};

const deleteUser = async (req, res) => {
  try {
    // Delete associated profile and subscriptions first
    await pb.collection('profiles').delete(req.params.id); // Assuming user ID is also profile ID
    await pb.collection('subscriptions').delete(req.params.id); // Assuming user ID is also subscription ID
    await pb.collection('users').delete(req.params.id);

    res.json({ msg: req.t('user_deleted') });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(req.t('server_error'));
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await pb.collection('users').count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await pb.collection('users').count({
      filter: `created >= "${today.toISOString().slice(0, 10)} 00:00:00"`
    });

    const activeSubscriptions = await pb.collection('subscriptions').count({
      filter: 'status = "active"'
    });
    
    // Placeholder for revenue calculation
    const monthlyRevenue = activeSubscriptions * 299;

    res.json({
      totalUsers,
      newUsersToday,
      activeSubscriptions,
      monthlyRevenue,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(req.t('server_error'));
  }
};

const getUserGrowthStats = async (req, res) => {
  try {
    // This would typically fetch time-series data for user growth
    // For now, returning placeholder data
    const userGrowthData = [
      { date: '2025-07-01', count: 100 },
      { date: '2025-07-08', count: 150 },
      { date: '2025-07-15', count: 200 },
      { date: '2025-07-22', count: 250 },
      { date: '2025-07-29', count: 300 },
      { date: '2025-08-05', count: 350 },
    ];

    res.json(userGrowthData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(req.t('server_error'));
  }
};

const getRevenueStats = async (req, res) => {
  try {
    // This would typically fetch time-series data for revenue
    // For now, returning placeholder data
    const revenueData = [
      { month: 'January 2025', revenue: 25000 },
      { month: 'February 2025', revenue: 28000 },
      { month: 'March 2025', revenue: 32000 },
      { month: 'April 2025', revenue: 35000 },
      { month: 'May 2025', revenue: 38000 },
      { month: 'June 2025', revenue: 42000 },
      { month: 'July 2025', revenue: 45000 },
    ];

    res.json(revenueData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(req.t('server_error'));
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getDashboardStats,
  getUserGrowthStats,
  getRevenueStats,
};