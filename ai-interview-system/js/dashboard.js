import { auth, database } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Check authentication
onAuthStateChanged(auth, async (user) => {
    // Check if user is logged in or admin
    const isAdmin = localStorage.getItem('isAdmin');
    
    if (!user && !isAdmin) {
        // No user logged in, redirect to login
        window.location.href = 'index.html';
        return;
    }
    
    if (user) {
        // Regular user - load their data
        try {
            const userRef = ref(database, 'users/' + user.uid);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
                const userData = snapshot.val();
                document.getElementById('userName').textContent = `Welcome, ${userData.fullName}`;
            } else {
                // User exists in auth but not in database - show email
                document.getElementById('userName').textContent = `Welcome, ${user.email}`;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            // Fallback to email if database read fails
            document.getElementById('userName').textContent = `Welcome, ${user.email}`;
        }
    } else if (isAdmin) {
        // Admin user
        document.getElementById('userName').textContent = 'Welcome, Admin';
    }
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        if (localStorage.getItem('isAdmin')) {
            // Admin logout
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
        } else {
            // Regular user logout
            await signOut(auth);
            localStorage.clear();
        }
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again');
    }
});
