// Store all contests globally
let allContests = [];

// Display contests
function displayContests(contests) {
    const contestsContainer = document.getElementById('contests-container');
    if (!contests.length) {
        contestsContainer.innerHTML = '<p>No contests found.</p>';
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const selected = currentUser?.selectedContests || [];

    contestsContainer.innerHTML = contests.map(contest => {
        const isSubscribed = selected.includes(contest.name);
        return `
        <div class="contest-card">
            <h2>${contest.name}</h2>
            <p><strong>Platform:</strong> ${contest.site}</p>
            <p><strong>Start:</strong> ${new Date(contest.start_time).toLocaleString()}</p>
            <p><strong>Duration:</strong> ${Math.round(contest.duration / 3600)} hours</p>
            <a href="${contest.url}" target="_blank" class="contest-link">Join Contest</a>
            <br>
            <button class="notify-btn" data-name="${contest.name}" style="
                background-color: ${isSubscribed ? '#28a745' : '#007bff'};
                color: white;
                border: none;
                padding: 0.4rem 0.8rem;
                border-radius: 5px;
                cursor: pointer;
            ">
                ${isSubscribed ? 'Subscribed' : 'Notify Me'}
            </button>
        </div>`;
    }).join('');

    document.querySelectorAll('.notify-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const contestName = e.target.getAttribute('data-name');
            let user = JSON.parse(localStorage.getItem('user'));
            if (!user) return;

            let selected = user.selectedContests || [];
            if (!selected.includes(contestName)) {
                selected.push(contestName);
                e.target.textContent = 'Subscribed';
                e.target.style.backgroundColor = '#28a745';
                e.target.style.cursor = 'default';
            } else {
                selected = selected.filter(c => c !== contestName);
                e.target.textContent = 'Notify Me';
                e.target.style.backgroundColor = '#007bff';
                e.target.style.cursor = 'pointer';
            }

            user.selectedContests = selected;
            localStorage.setItem('user', JSON.stringify(user));

            // Update users array
            let users = JSON.parse(localStorage.getItem('users')) || [];
            users = users.map(u => u.email === user.email ? user : u);
            localStorage.setItem('users', JSON.stringify(users));

            updateNotificationsTab();
        });
    });
}

// Notifications tab
function updateNotificationsTab() {
    const user = JSON.parse(localStorage.getItem('user'));
    const selected = user?.selectedContests || [];
    const notificationList = document.getElementById('notification-list');
    const now = new Date();

    const upcoming = allContests.filter(contest =>
        selected.includes(contest.name) &&
        new Date(contest.start_time) > now
    );

    if (!upcoming.length) {
        notificationList.innerHTML = '<li>No upcoming notifications.</li>';
        return;
    }

    notificationList.innerHTML = upcoming.map(contest => {
        const startTime = new Date(contest.start_time);
        const minutesLeft = Math.floor((startTime - now)/60000);
        return `<li><strong>${contest.name}</strong> (${contest.site}) starts at ${startTime.toLocaleString()} (in ${minutesLeft} mins)</li>`;
    }).join('');
}

// Profile tab
function updateProfile() {
    const profileContainer = document.getElementById('profile-container');
    profileContainer.innerHTML = '';

    let user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        // Show login form
        profileContainer.innerHTML = `
            <h2>Login</h2>
            <form id="profile-login-form">
                <label>Email:</label>
                <input type="email" id="profile-email" placeholder="Enter your email" required>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <button id="register-btn">Register</button></p>
            <div id="login-error" style="color:red; margin-top:5px;"></div>
        `;

        const users = JSON.parse(localStorage.getItem('users')) || [];

        document.getElementById('profile-login-form').addEventListener('submit', e => {
            e.preventDefault();
            const email = document.getElementById('profile-email').value.trim();
            const foundUser = users.find(u => u.email === email);
            const errorDiv = document.getElementById('login-error');

            if (foundUser) {
                localStorage.setItem('user', JSON.stringify(foundUser));
                localStorage.setItem('selectedContests', JSON.stringify(foundUser.selectedContests || []));
                updateProfile();
            } else {
                errorDiv.textContent = "User not registered. Please register first.";
            }
        });

        document.getElementById('register-btn').addEventListener('click', () => {
            profileContainer.innerHTML = `
                <h2>Register</h2>
                <form id="profile-register-form">
                    <label>Name:</label>
                    <input type="text" id="register-name" placeholder="Enter your name" required>
                    <label>Email:</label>
                    <input type="email" id="register-email" placeholder="Enter your email" required>
                    <button type="submit">Register</button>
                </form>
                <div id="register-error" style="color:red; margin-top:5px;"></div>
            `;

            document.getElementById('profile-register-form').addEventListener('submit', e => {
                e.preventDefault();
                const name = document.getElementById('register-name').value.trim();
                const email = document.getElementById('register-email').value.trim();
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const errorDiv = document.getElementById('register-error');

                if (users.find(u => u.email === email)) {
                    errorDiv.textContent = "Email already registered. Please login.";
                    return;
                }

                const newUser = { name, email, selectedContests: [] };
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('user', JSON.stringify(newUser));
                localStorage.setItem('selectedContests', JSON.stringify([]));
                updateProfile();
            });
        });

    } else {
        // Show user info
        const selectedContests = user.selectedContests || [];
        profileContainer.innerHTML = `
            <h2>User Profile</h2>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <h3>Selected Contests</h3>
            <ul id="user-contests-list">
                ${selectedContests.length ? selectedContests.map(c => `<li>${c}</li>`).join('') : '<li>No contests selected.</li>'}
            </ul>
            <button id="logout-btn">Logout</button>
        `;

        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('user');
            localStorage.removeItem('selectedContests');
            window.location.href = 'login.html';
        });
    }
}

// Admin panel
// function updateAdminPanel() {
//     const adminPanel = document.getElementById('admin-panel');
//     if (!adminPanel) return;

//     const users = JSON.parse(localStorage.getItem('users')) || [];
//     const tbody = document.getElementById('users-table-body');
//     tbody.innerHTML = '';

//     users.forEach((user, index) => {
//         const row = document.createElement('tr');
//         row.innerHTML = `
//             <td>${user.name}</td>
//             <td>${user.email}</td>
//             <td>${(user.selectedContests || []).join(', ') || 'None'}</td>
//             <td><button class="delete-btn" data-index="${index}">Delete</button></td>
//         `;
//         tbody.appendChild(row);
//     });

//     document.querySelectorAll('.delete-btn').forEach(btn => {
//         btn.addEventListener('click', e => {
//             const idx = parseInt(e.target.getAttribute('data-index'));
//             let users = JSON.parse(localStorage.getItem('users')) || [];
//             users.splice(idx, 1);
//             localStorage.setItem('users', JSON.stringify(users));
//             updateAdminPanel();
//         });
//     });
// }

// Fetch contests from backend
async function fetchContests() {
    try {
        const response = await fetch('http://localhost:3001/api/contests');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        allContests = data.contests || [];
        displayContests(allContests);
    } catch (err) {
        document.getElementById('contests-container').innerHTML = `<p class="error">Error: ${err.message}</p>`;
    }
}

// Search
function setupSearch() {
    const searchBar = document.getElementById('search-bar');
    searchBar.addEventListener('input', () => {
        const query = searchBar.value.toLowerCase();
        const filtered = allContests.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.site.toLowerCase().includes(query)
        );
        displayContests(filtered);
    });
}

// Navbar
function setupNavbar() {
  document.querySelectorAll('#nav-links .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      const contestsContainer = document.getElementById('contests-container');
      const searchBar = document.getElementById('search-bar');
      const notificationsContainer = document.getElementById('notifications-container');
      const profileContainer = document.getElementById('profile-container');
  
      // Hide all tabs first
      contestsContainer.style.display = 'none';
      searchBar.style.display = 'none';
      notificationsContainer.style.display = 'none';
      profileContainer.style.display = 'none';
  
      if (tab === 'notifications') {
        notificationsContainer.style.display = 'block';
        updateNotificationsTab();
      } else if (tab === 'profile') {
        profileContainer.style.display = 'block';
        updateProfile();
      } else { // Home
        contestsContainer.style.display = 'flex';
        searchBar.style.display = 'block';
      }
    });
  });
  
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    fetchContests();
    setupSearch();
    setupNavbar();
    setInterval(updateNotificationsTab, 60000); // refresh notifications
});
