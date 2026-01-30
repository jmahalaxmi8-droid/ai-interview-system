# Quick Setup Guide

## 🔥 Firebase Setup (5 minutes)

### Step 1: Create Firebase Project
1. Visit https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Enter project name: "AI-Interview-System" (or any name)
4. Continue through the setup wizard
5. Wait for project creation

### Step 2: Enable Authentication
1. In your Firebase project, click "Authentication" in left sidebar
2. Click "Get Started" button
3. Select "Sign-in method" tab
4. Click on "Email/Password"
5. Enable the first toggle (Email/Password)
6. Click "Save"

### Step 3: Enable Realtime Database
1. Click "Realtime Database" in left sidebar
2. Click "Create Database"
3. Choose location (closest to you)
4. Start in "test mode" for now
5. Click "Enable"

### Step 4: Get Configuration
1. Click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon "</>"
5. Register your app with a nickname
6. Copy the `firebaseConfig` object (looks like below):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 5: Configure Application
1. Open the extracted project folder
2. Navigate to `js/firebase-config.js`
3. Replace the placeholder config with YOUR config from Step 4
4. Save the file

### Step 6: Import Sample Data (Optional but Recommended)
1. In Firebase Console, go to Realtime Database
2. Click the three dots menu (⋮)
3. Select "Import JSON"
4. Choose `firebase-sample-data.json` from project folder
5. Click "Import"
6. This creates sample questions and a test user

## 💻 Running the Application

### Method 1: VS Code with Live Server (Recommended)
1. Open Visual Studio Code
2. Install "Live Server" extension by Ritwick Dey
3. Open the project folder: File → Open Folder → Select ai-interview-system
4. Right-click on `index.html`
5. Select "Open with Live Server"
6. Application opens in browser automatically

### Method 2: Python HTTP Server
1. Open terminal/command prompt
2. Navigate to project folder
3. Run: `python -m http.server 8000`
4. Open browser and go to: http://localhost:8000

### Method 3: Direct File Open (Limited Features)
1. Navigate to project folder
2. Double-click `index.html`
3. Note: Voice features may not work due to security restrictions

## 🧪 Testing the Application

### Test Regular User Account
1. Click "Sign Up" on login page
2. Enter:
   - Full Name: Your Name
   - Email: test@example.com
   - Password: test123 (or any 6+ characters)
3. Sign up and login with same credentials

### Test Admin Account
1. On login page, enter:
   - Email: admin@aiinterview.com
   - Password: admin123
2. This takes you to admin panel

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Realtime Database enabled
- [ ] Configuration updated in firebase-config.js
- [ ] Application runs in browser
- [ ] Can sign up new user
- [ ] Can login successfully
- [ ] Dashboard loads properly
- [ ] Can start a test
- [ ] Questions display correctly
- [ ] Timer works
- [ ] Can submit test and see results
- [ ] Voice recording works (allow microphone)
- [ ] Charts display in Results page
- [ ] Admin panel accessible

## 🔧 Common Issues & Solutions

### Issue: "Firebase not initialized"
**Solution**: Check firebase-config.js has correct credentials from your Firebase project

### Issue: "Authentication failed"
**Solution**: 
- Verify Email/Password is enabled in Firebase Authentication
- Check email format is valid
- Password must be at least 6 characters

### Issue: "Questions not loading"
**Solution**: 
- Import firebase-sample-data.json to your database
- OR wait - questions will load from JavaScript fallback

### Issue: "Voice recognition not working"
**Solution**: 
- Use Chrome or Edge browser
- Allow microphone permissions when prompted
- Must use HTTPS or localhost (not file://)

### Issue: "Charts not displaying"
**Solution**: 
- Check internet connection (Chart.js loads from CDN)
- Complete at least one test first
- Open browser console (F12) to check for errors

### Issue: "Live Server not opening"
**Solution**: 
- Install Live Server extension in VS Code
- Right-click on index.html (not other files)
- If still not working, use Python method

## 📱 Browser Compatibility

**Recommended**: 
- Google Chrome (Best support for all features)
- Microsoft Edge

**Supported**:
- Firefox (Voice features may vary)
- Safari (Voice features may vary)

**Not Recommended**:
- Internet Explorer (Not supported)

## 🎯 Next Steps After Setup

1. **Customize**: 
   - Add your own questions to Firebase
   - Change colors in style.css
   - Modify timer duration in test files

2. **Secure Database**:
   - In Firebase Console → Realtime Database → Rules
   - Change to production rules (after testing)

3. **Deploy** (Optional):
   - Use Firebase Hosting
   - Or any static hosting service

4. **Add Features**:
   - More question topics
   - Email notifications
   - Certificate generation
   - PDF report downloads

## 📞 Need Help?

1. Check README.md for detailed documentation
2. Review troubleshooting section
3. Check browser console (F12) for error messages
4. Verify all files are in correct folders
5. Ensure Firebase configuration is correct

## 🎉 Success Indicators

You've successfully set up the project when:
- ✅ Login page loads without errors
- ✅ Can create new account
- ✅ Dashboard shows after login
- ✅ Can navigate to all modules
- ✅ Tests run with timer
- ✅ Results save and display
- ✅ Admin panel shows user data

---

**Time to Complete Setup**: 10-15 minutes
**Difficulty**: Beginner-friendly
**Prerequisites**: Web browser, text editor, Firebase account (free)

**Ready to start?** Follow the steps above in order!
