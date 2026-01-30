# AI Powered Interview Evaluation System

A comprehensive full-stack web application for evaluating candidates through aptitude tests, technical interviews, and voice analysis.

## 🎯 Features

### 1. Authentication Module
- Email/Password login and signup
- Firebase Authentication integration
- Password reset functionality
- Secure session management
- Admin panel access

### 2. Dashboard
- Clean, mobile-responsive interface
- Quick access to all modules
- User profile display

### 3. Aptitude Test Module
- Topics: Percentage, Probability, Mixtures, Ages, Calendars
- 15 MCQ questions per topic
- 25-minute countdown timer
- Automatic evaluation
- Detailed results with correct answers

### 4. Technical Interview Module
- Topics: HTML, Java, CSS, PHP, Python, SQL
- 15 MCQ questions per topic
- 25-minute countdown timer
- Automatic scoring
- Review of incorrect answers

### 5. Voice Interview Module
- Real-time speech-to-text conversion
- Emotion detection (Happy, Sad, Bold, Sorrow, Confident)
- Live transcript display
- Emotion analysis visualization
- Recording controls

### 6. Results & Analytics
- Overall performance visualization
- Chart.js graphs and charts
- Category-wise score breakdown
- Eligibility determination
- Personalized recommendations

### 7. Admin Panel
- User management
- Performance tracking
- Statistics dashboard
- Detailed user analytics

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Realtime Database
- **Authentication**: Firebase Authentication
- **Charts**: Chart.js
- **Voice**: Web Speech API
- **Responsive**: Mobile-first design

## 📋 Prerequisites

1. Modern web browser (Chrome, Firefox, Edge, Safari)
2. Firebase account (free tier works fine)
3. Visual Studio Code (recommended)
4. Live Server extension for VS Code

## 🚀 Setup Instructions

### Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable Email/Password authentication
4. Enable **Realtime Database**:
   - Go to Realtime Database → Create Database
   - Start in **test mode** (you can secure it later)
5. Get your Firebase configuration:
   - Go to Project Settings → General
   - Scroll to "Your apps" section
   - Click on Web app (</>) icon
   - Copy the firebaseConfig object

### Step 2: Configure the Application

1. Extract the project files
2. Open `js/firebase-config.js`
3. Replace the placeholder config with your Firebase credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 3: Import Sample Data (Optional)

1. Go to Firebase Console → Realtime Database
2. Click on "Import JSON"
3. Import the `firebase-sample-data.json` file included in this project
4. This will create sample questions for all topics

### Step 4: Run the Application

1. Open the project folder in Visual Studio Code
2. Install "Live Server" extension if not installed
3. Right-click on `index.html`
4. Select "Open with Live Server"
5. The application will open in your default browser

## 👤 User Accounts

### Regular User
- Sign up with any email and password (minimum 6 characters)
- Access all test modules
- View personal results and analytics

### Admin Account
- **Email**: admin@aiinterview.com
- **Password**: admin123
- Access admin panel at `/admin.html`
- View all users and their performance

## 📱 Usage Guide

### For Students/Candidates

1. **Sign Up**: Create an account with your email
2. **Login**: Access your dashboard
3. **Take Tests**: 
   - Select Aptitude or Technical module
   - Choose a topic
   - Complete 15 questions in 25 minutes
   - View results and review incorrect answers
4. **Voice Interview**:
   - Click "Start Recording"
   - Speak clearly about your skills and experience
   - Click "Stop Recording"
   - View emotion analysis
   - Save the interview
5. **Check Results**:
   - Go to Results & Analytics
   - View performance charts
   - Check eligibility status
   - Read recommendations

### For Administrators

1. **Login**: Use admin credentials
2. **View Dashboard**: See overall statistics
3. **Manage Users**: View registered users
4. **Track Performance**: Monitor test scores and completion
5. **View Details**: Click "View Details" for individual user analysis

## 🗂 Project Structure

```
ai-interview-system/
│
├── index.html                 # Login page
├── signup.html               # Registration page
├── dashboard.html            # Main dashboard
├── aptitude.html             # Aptitude test interface
├── technical.html            # Technical interview interface
├── voice.html                # Voice interview interface
├── results.html              # Results and analytics
├── admin.html                # Admin panel
│
├── css/
│   └── style.css             # Complete stylesheet
│
├── js/
│   ├── firebase-config.js    # Firebase configuration
│   ├── auth.js               # Authentication logic
│   ├── signup.js             # Registration logic
│   ├── dashboard.js          # Dashboard functionality
│   ├── aptitude.js           # Aptitude test logic
│   ├── technical.js          # Technical test logic
│   ├── voice.js              # Voice interview logic
│   ├── results.js            # Results and charts
│   └── admin.js              # Admin panel logic
│
├── firebase-sample-data.json # Sample database structure
└── README.md                 # This file
```

## 🔧 Troubleshooting

### Firebase Connection Issues
- Verify Firebase configuration in `firebase-config.js`
- Check if Authentication and Realtime Database are enabled
- Ensure database rules allow read/write access

### Speech Recognition Not Working
- Use Chrome or Edge browser (best support)
- Allow microphone permissions
- Check if HTTPS is enabled (required for Web Speech API)

### Tests Not Loading
- Import sample data to Firebase
- Check browser console for errors
- Verify database structure matches expected format

### Charts Not Displaying
- Ensure Chart.js CDN is accessible
- Check if you have completed at least one test
- Verify results are saved in Firebase

## 📊 Database Structure

```json
{
  "users": {
    "userId1": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "registrationDate": "2024-01-30T10:00:00.000Z",
      "aptitudeTests": {
        "percentage": {
          "score": 85,
          "correctAnswers": 13,
          "totalQuestions": 15,
          "date": "2024-01-30T11:00:00.000Z"
        }
      },
      "technicalTests": {
        "html": {
          "score": 90,
          "correctAnswers": 14,
          "totalQuestions": 15,
          "date": "2024-01-30T12:00:00.000Z"
        }
      },
      "voiceInterviews": {
        "1706616000000": {
          "transcript": "I am confident...",
          "emotionScores": {
            "happy": 5,
            "confident": 10,
            "sad": 0,
            "bold": 3,
            "sorrow": 0
          },
          "dominantEmotion": "confident",
          "date": "2024-01-30T13:00:00.000Z"
        }
      }
    }
  },
  "questions": {
    "aptitude": {
      "percentage": { ... },
      "probability": { ... }
    },
    "technical": {
      "html": { ... },
      "java": { ... }
    }
  }
}
```

## 🎨 Customization

### Adding New Topics
1. Add questions to Firebase under appropriate path
2. Update topic cards in HTML
3. Questions must follow the format:
```json
{
  "question": "Question text?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": 0
}
```

### Changing Timer Duration
- Modify `timeRemaining` variable in aptitude.js or technical.js
- Value is in seconds (1500 = 25 minutes)

### Adjusting Eligibility Criteria
- Edit `isEligible` logic in results.js
- Current: Overall average >= 60% and voice interview completed

## 📝 Features for College Project Submission

✅ Complete authentication system with validation  
✅ Multiple test modules with different topics  
✅ Real-time countdown timer  
✅ Automatic evaluation and scoring  
✅ Voice recognition with emotion detection  
✅ Data visualization with charts  
✅ Admin panel for management  
✅ Mobile responsive design  
✅ Firebase integration  
✅ Clean, professional UI  
✅ Well-structured codebase  
✅ Comprehensive documentation  

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify Firebase configuration
3. Check browser console for errors
4. Ensure all files are properly uploaded

## 📄 License

This project is created for educational purposes as a college mini project.

## 🎓 Project Information

- **Project Type**: College Mini Project
- **Domain**: AI & Web Development
- **Suitable For**: Final year projects, web development assignments
- **Difficulty**: Intermediate
- **Completion Time**: Fully functional system

---

**Note**: Make sure to configure Firebase properly before running the application. Without proper Firebase setup, the authentication and data storage features will not work.

## 🚀 Quick Start Summary

1. Create Firebase project
2. Enable Authentication and Realtime Database
3. Copy Firebase config to `js/firebase-config.js`
4. Open in VS Code with Live Server
5. Access at `http://localhost:5500` or `http://127.0.0.1:5500`

**Admin Access**: admin@aiinterview.com / admin123

Happy Testing! 🎉
