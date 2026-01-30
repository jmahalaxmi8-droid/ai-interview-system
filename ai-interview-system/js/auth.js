import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Get DOM elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeModal = document.querySelector('.close');
const sendResetBtn = document.getElementById('sendResetBtn');
const resetEmailInput = document.getElementById('resetEmail');

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password validation
function validatePassword(password) {
    return password.length >= 6;
}

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    emailError.textContent = '';
    passwordError.textContent = '';
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validate inputs
    let isValid = true;
    
    if (!validateEmail(email)) {
        emailError.textContent = 'Please enter a valid email address';
        isValid = false;
    }
    
    if (!validatePassword(password)) {
        passwordError.textContent = 'Password must be at least 6 characters';
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Check for admin login
    if (email === 'admin@aiinterview.com' && password === 'admin123') {
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('userEmail', email);
        window.location.href = 'admin.html';
        return;
    }
    
    try {
        // Sign in with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store user info in localStorage
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('userEmail', user.email);
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Login error:', error);
        
        switch (error.code) {
            case 'auth/user-not-found':
                emailError.textContent = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                passwordError.textContent = 'Incorrect password';
                break;
            case 'auth/invalid-email':
                emailError.textContent = 'Invalid email format';
                break;
            case 'auth/too-many-requests':
                passwordError.textContent = 'Too many failed attempts. Please try again later';
                break;
            default:
                passwordError.textContent = 'Login failed. Please try again';
        }
    }
});

// Forgot password modal
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    forgotPasswordModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
    }
});

// Send password reset email
sendResetBtn.addEventListener('click', async () => {
    const email = resetEmailInput.value.trim();
    
    if (!validateEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    try {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent! Please check your inbox.');
        forgotPasswordModal.style.display = 'none';
        resetEmailInput.value = '';
    } catch (error) {
        console.error('Password reset error:', error);
        
        switch (error.code) {
            case 'auth/user-not-found':
                alert('No account found with this email');
                break;
            default:
                alert('Failed to send reset email. Please try again');
        }
    }
});
