document.addEventListener('DOMContentLoaded', () => {
  const userTableBody = document.getElementById('user-table-body');
  const token = localStorage.getItem('admin-token'); // Assuming token is stored in localStorage after admin login

  if (!token) {
    window.location.href = '/admin-panel/login.html'; // Redirect to a login page if not authenticated
    return;
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const users = await response.json();
      renderUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Could not fetch users. Please check your credentials and try again.');
    }
  };

  const renderUsers = (users) => {
    userTableBody.innerHTML = '';
    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user._id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>
          <button class="delete-btn" data-id="${user._id}">Delete</button>
        </td>
      `;
      userTableBody.appendChild(row);
    });
  };

  userTableBody.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete-btn')) {
      const userId = event.target.dataset.id;
      if (confirm(`Are you sure you want to delete user ${userId}?`)) {
        try {
          const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'x-auth-token': token,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to delete user');
          }

          alert('User deleted successfully');
          fetchUsers(); // Refresh the user list
        } catch (error) {
          console.error('Error deleting user:', error);
          alert('Could not delete user.');
        }
      }
    }
  });

  fetchUsers();
});
