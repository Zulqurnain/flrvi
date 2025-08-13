document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('admin-token');
  
  if (!token) {
    window.location.href = '/admin-panel/login.html';
    return;
  }

  // Fetch and display dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/v1/admin/stats/summary', {
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const stats = await response.json();
      document.getElementById('total-users').textContent = stats.totalUsers;
      document.getElementById('new-users-today').textContent = stats.newUsersToday;
      document.getElementById('active-subscriptions').textContent = stats.activeSubscriptions;
      document.getElementById('monthly-revenue').textContent = stats.monthlyRevenue;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      alert('Could not fetch dashboard statistics.');
    }
  };

  // Fetch and render user growth chart
  const renderUserGrowthChart = async () => {
    try {
      const response = await fetch('/api/v1/admin/stats/user-growth', {
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user growth data');
      }

      const data = await response.json();
      
      const ctx = document.getElementById('userGrowthChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(item => item.date),
          datasets: [{
            label: 'User Growth',
            data: data.map(item => item.count),
            borderColor: '#E91E63',
            backgroundColor: 'rgba(233, 30, 99, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error rendering user growth chart:', error);
    }
  };

  // Fetch and render revenue chart
  const renderRevenueChart = async () => {
    try {
      const response = await fetch('/api/v1/admin/stats/revenue', {
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }

      const data = await response.json();
      
      const ctx = document.getElementById('revenueChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(item => item.month),
          datasets: [{
            label: 'Revenue (THB)',
            data: data.map(item => item.revenue),
            backgroundColor: '#FF9800',
            borderColor: '#FF9800',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error rendering revenue chart:', error);
    }
  };

  // Initialize dashboard
  fetchDashboardStats();
  renderUserGrowthChart();
  renderRevenueChart();
});