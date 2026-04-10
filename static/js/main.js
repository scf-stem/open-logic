// Main.js - Global Logic

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    setupNavbar();
});

function checkAuthState() {
    // For MVP prototype, we might just check separate cookies or localStorage
    // This logic connects with the backend API later.
    // Here is a mock implementation for UI testing:
    
    const userJson = localStorage.getItem('osi_user');
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const navAvatar = document.getElementById('navAvatar');

    if (userJson) {
        const user = JSON.parse(userJson);
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) {
            userProfile.style.display = 'flex';
            navAvatar.textContent = user.username[0].toUpperCase();
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex'; // Default flex
        if (userProfile) userProfile.style.display = 'none';
    }

    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('osi_user');
            // Also call backend logout API
            window.location.reload();
        });
    }
}

function setupNavbar() {
    // Mobile menu toggle logic to be added here
}
