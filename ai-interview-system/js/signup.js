import { auth, database } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    ref, 
    set 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Get DOM elements
const signupForm = document.getElementById('signupForm');
const fullNameInput = document.getElementById('fullName');
const signupEmailInput = document.getElementById('signupEmail');
const signupPasswordInput = document.getElementById('signupPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const signupEmailError = document.getElementById('signupEmailError');
const signupPasswordError = document.getElementById('signupPasswordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password validation
function validatePassword(password) {
    return password.length >= 6;
}

// Signup form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    signupEmailError.textContent = '';
    signupPasswordError.textContent = '';
    confirmPasswordError.textContent = '';
    
    const fullName = fullNameInput.value.trim();
    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Validate inputs
    let isValid = true;
    
    if (!fullName) {
        alert('Please enter your full name');
        isValid = false;
    }
    
    if (!validateEmail(email)) {
        signupEmailError.textContent = 'Please enter a valid email address';
        isValid = false;
    }
    
    if (!validatePassword(password)) {
        signupPasswordError.textContent = 'Password must be at least 6 characters';
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        confirmPasswordError.textContent = 'Passwords do not match';
        isValid = false;
    }
    
    if (!isValid) return;
    
    try {
        // Create user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save user data to Realtime Database
        const userRef = ref(database, 'users/' + user.uid);
        await set(userRef, {
            fullName: fullName,
            email: email,
            registrationDate: new Date().toISOString(),
            aptitudeTests: {},
            technicalTests: {},
            voiceInterviews: {}
        });
        
        alert('Account created successfully! Please login.');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Signup error:', error);
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                signupEmailError.textContent = 'This email is already registered';
                break;
            case 'auth/invalid-email':
                signupEmailError.textContent = 'Invalid email format';
                break;
            case 'auth/weak-password':
                signupPasswordError.textContent = 'Password is too weak';
                break;
            default:
                alert('Signup failed. Please try again');
        }
    }
});
