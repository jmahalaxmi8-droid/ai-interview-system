import { auth, database } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Check authentication
onAuthStateChanged(auth, async (user) => {
    if (!user && !localStorage.getItem('isAdmin')) {
        window.location.href = 'index.html';
    } else if (user) {
        // Load user name
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const userData = snapshot.val();
            document.getElementById('userName').textContent = `Welcome, ${userData.fullName}`;
        }
    } else if (localStorage.getItem('isAdmin')) {
        document.getElementById('userName').textContent = 'Welcome, Admin';
    }
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        if (localStorage.getItem('isAdmin')) {
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('userEmail');
        } else {
            await signOut(auth);
            localStorage.clear();
        }
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again');
    }
});
