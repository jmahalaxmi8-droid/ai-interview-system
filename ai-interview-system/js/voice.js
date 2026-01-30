import { auth, database } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { ref, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

let currentUser = null;
let recognition = null;
let isRecording = false;
let transcript = '';
let emotionScores = {
    happy: 0,
    sad: 0,
    bold: 0,
    sorrow: 0,
    confident: 0
};

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (!user && !localStorage.getItem('userId')) {
        window.location.href = 'index.html';
    } else {
        currentUser = user || { uid: localStorage.getItem('userId') };
    }
});

// Initialize Web Speech API
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcriptPiece + ' ';
            } else {
                interimTranscript += transcriptPiece;
            }
        }
        
        transcript = finalTranscript + interimTranscript;
        document.getElementById('transcript').textContent = transcript || 'Your speech will appear here...';
        
        // Analyze emotions from transcript
        if (finalTranscript) {
            analyzeEmotions(finalTranscript);
        }
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
            document.getElementById('statusText').textContent = 'No speech detected. Try speaking again.';
        }
    };
    
    recognition.onend = () => {
        if (isRecording) {
            recognition.start(); // Restart if still recording
        }
    };
} else {
    alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
}

// Start recording button
document.getElementById('startRecording').addEventListener('click', () => {
    if (!recognition) {
        alert('Speech recognition not available');
        return;
    }
    
    isRecording = true;
    transcript = '';
    emotionScores = { happy: 0, sad: 0, bold: 0, sorrow: 0, confident: 0 };
    
    document.getElementById('transcript').textContent = 'Listening...';
    document.getElementById('statusIndicator').classList.add('recording');
    document.getElementById('statusText').textContent = 'Recording...';
    document.getElementById('startRecording').disabled = true;
    document.getElementById('stopRecording').disabled = false;
    
    recognition.start();
});

// Stop recording button
document.getElementById('stopRecording').addEventListener('click', () => {
    isRecording = false;
    
    if (recognition) {
        recognition.stop();
    }
    
    document.getElementById('statusIndicator').classList.remove('recording');
    document.getElementById('statusText').textContent = 'Recording Stopped';
    document.getElementById('startRecording').disabled = false;
    document.getElementById('stopRecording').disabled = true;
    document.getElementById('saveInterview').style.display = 'block';
    
    // Final emotion analysis
    if (transcript) {
        analyzeEmotions(transcript);
        updateEmotionDisplay();
    }
});

// Emotion analysis using keyword detection
function analyzeEmotions(text) {
    const lowerText = text.toLowerCase();
    
    // Happy keywords
    const happyKeywords = ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'excellent', 'fantastic', 'love', 'enjoy', 'glad', 'pleased', 'delighted', 'cheerful'];
    happyKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) emotionScores.happy += 2;
    });
    
    // Sad keywords
    const sadKeywords = ['sad', 'unhappy', 'disappointed', 'down', 'upset', 'depressed', 'miserable', 'unfortunate', 'regret', 'sorry'];
    sadKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) emotionScores.sad += 2;
    });
    
    // Bold/Strong keywords
    const boldKeywords = ['strong', 'powerful', 'bold', 'determined', 'assertive', 'brave', 'courageous', 'fierce', 'tough', 'resilient'];
    boldKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) emotionScores.bold += 2;
    });
    
    // Sorrow keywords
    const sorrowKeywords = ['sorrow', 'grief', 'pain', 'hurt', 'suffering', 'agony', 'anguish', 'distress', 'troubled', 'worried'];
    sorrowKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) emotionScores.sorrow += 2;
    });
    
    // Confident keywords
    const confidentKeywords = ['confident', 'sure', 'certain', 'believe', 'trust', 'capable', 'skilled', 'competent', 'able', 'ready', 'prepared', 'experienced'];
    confidentKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) emotionScores.confident += 2;
    });
    
    // Analyze sentence structure and tone
    const sentences = text.split(/[.!?]+/);
    sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        if (trimmed) {
            // Exclamation marks indicate excitement/happiness
            if (sentence.includes('!')) emotionScores.happy += 1;
            
            // Questions might indicate confidence in asking
            if (sentence.includes('?')) emotionScores.confident += 0.5;
            
            // Long, complex sentences indicate confidence
            if (trimmed.split(' ').length > 15) emotionScores.confident += 1;
            
            // Use of "I can", "I will", "I am" indicates confidence
            if (/\b(i can|i will|i am|i'm)\b/i.test(trimmed)) {
                emotionScores.confident += 1.5;
            }
        }
    });
    
    updateEmotionDisplay();
}

// Update emotion display
function updateEmotionDisplay() {
    const total = Object.values(emotionScores).reduce((a, b) => a + b, 0);
    
    if (total === 0) return;
    
    // Calculate percentages
    const percentages = {};
    for (let emotion in emotionScores) {
        percentages[emotion] = Math.round((emotionScores[emotion] / total) * 100);
    }
    
    // Update bars
    document.getElementById('happyBar').style.width = percentages.happy + '%';
    document.getElementById('happyPercent').textContent = percentages.happy + '%';
    
    document.getElementById('sadBar').style.width = percentages.sad + '%';
    document.getElementById('sadPercent').textContent = percentages.sad + '%';
    
    document.getElementById('boldBar').style.width = percentages.bold + '%';
    document.getElementById('boldPercent').textContent = percentages.bold + '%';
    
    document.getElementById('sorrowBar').style.width = percentages.sorrow + '%';
    document.getElementById('sorrowPercent').textContent = percentages.sorrow + '%';
    
    document.getElementById('confidentBar').style.width = percentages.confident + '%';
    document.getElementById('confidentPercent').textContent = percentages.confident + '%';
    
    // Determine dominant emotion
    let maxEmotion = 'confident';
    let maxScore = emotionScores.confident;
    
    for (let emotion in emotionScores) {
        if (emotionScores[emotion] > maxScore) {
            maxScore = emotionScores[emotion];
            maxEmotion = emotion;
        }
    }
    
    const emotionEmojis = {
        happy: '😊 Happy',
        sad: '😢 Sad',
        bold: '💪 Bold',
        sorrow: '😰 Sorrow',
        confident: '😎 Confident'
    };
    
    document.getElementById('dominantEmotion').textContent = emotionEmojis[maxEmotion];
}

// Save interview
document.getElementById('saveInterview').addEventListener('click', async () => {
    if (!transcript || transcript === 'Your speech will appear here...') {
        alert('No speech recorded to save');
        return;
    }
    
    try {
        // Determine dominant emotion
        let dominantEmotion = 'confident';
        let maxScore = emotionScores.confident;
        
        for (let emotion in emotionScores) {
            if (emotionScores[emotion] > maxScore) {
                maxScore = emotionScores[emotion];
                dominantEmotion = emotion;
            }
        }
        
        // Save to Firebase
        const voiceRef = ref(database, `users/${currentUser.uid}/voiceInterviews/${Date.now()}`);
        await set(voiceRef, {
            transcript: transcript,
            emotionScores: emotionScores,
            dominantEmotion: dominantEmotion,
            date: new Date().toISOString()
        });
        
        alert('Voice interview saved successfully!');
        
        // Reset
        document.getElementById('saveInterview').style.display = 'none';
        
        // Ask if user wants to record another
        if (confirm('Would you like to record another interview?')) {
            transcript = '';
            emotionScores = { happy: 0, sad: 0, bold: 0, sorrow: 0, confident: 0 };
            document.getElementById('transcript').textContent = 'Your speech will appear here...';
            updateEmotionDisplay();
            document.getElementById('dominantEmotion').textContent = 'Not Analyzed Yet';
        } else {
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('Error saving interview:', error);
        alert('Failed to save interview. Please try again.');
    }
});
