import { auth, database } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { ref, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

let currentUser = null;
let recognition = null;
let isRecording = false;
let transcript = '';
let emotionScores = {
    notconfident: 0,
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
    emotionScores = { notconfident: 0, confident: 0 };
    
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
    
    // Not Confident keywords
    const notConfidentKeywords = [
        'maybe', 'perhaps', 'might', 'possibly', 'unsure', 'uncertain', 
        'don\'t know', 'not sure', 'i think', 'i guess', 'kind of', 
        'sort of', 'um', 'uh', 'er', 'hmm', 'nervous', 'worried', 
        'scared', 'afraid', 'doubt', 'hesitant', 'uncomfortable'
    ];
    notConfidentKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) emotionScores.notconfident += 2;
    });
    
    // Confident keywords
    const confidentKeywords = [
        'confident', 'sure', 'certain', 'definitely', 'absolutely', 
        'clearly', 'obviously', 'believe', 'trust', 'capable', 
        'skilled', 'competent', 'able', 'ready', 'prepared', 
        'experienced', 'know', 'will', 'can', 'achieve', 'succeed'
    ];
    confidentKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) emotionScores.confident += 2;
    });
    
    // Analyze sentence structure and tone
    const sentences = text.split(/[.!?]+/);
    sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        if (trimmed) {
            // Exclamation marks indicate confidence
            if (sentence.includes('!')) emotionScores.confident += 1;
            
            // Too many questions might indicate lack of confidence
            if (sentence.includes('?')) {
                // Check if it's a rhetorical/confident question
                if (/\b(can't we|shouldn't we|isn't it|right\?|correct\?)\b/i.test(trimmed)) {
                    emotionScores.confident += 0.5;
                } else {
                    emotionScores.notconfident += 0.3;
                }
            }
            
            // Long, complex sentences indicate confidence
            if (trimmed.split(' ').length > 15) emotionScores.confident += 1;
            
            // Short, choppy sentences might indicate nervousness
            if (trimmed.split(' ').length < 5) emotionScores.notconfident += 0.5;
            
            // Use of "I can", "I will", "I am" indicates confidence
            if (/\b(i can|i will|i am confident|i'm confident|i know)\b/i.test(trimmed)) {
                emotionScores.confident += 1.5;
            }
            
            // Hedging language indicates lack of confidence
            if (/\b(probably|basically|actually|literally|like)\b/i.test(trimmed)) {
                emotionScores.notconfident += 0.5;
            }
        }
    });
    
    updateEmotionDisplay();
}

// Update emotion display
function updateEmotionDisplay() {
    const total = Object.values(emotionScores).reduce((a, b) => a + b, 0);
    
    if (total === 0) {
        // Show 50-50 split if no data
        document.getElementById('notconfidentBar').style.width = '50%';
        document.getElementById('notconfidentPercent').textContent = '50%';
        document.getElementById('confidentBar').style.width = '50%';
        document.getElementById('confidentPercent').textContent = '50%';
        return;
    }
    
    // Calculate percentages
    const percentages = {};
    for (let emotion in emotionScores) {
        percentages[emotion] = Math.round((emotionScores[emotion] / total) * 100);
    }
    
    // Update bars
    document.getElementById('notconfidentBar').style.width = percentages.notconfident + '%';
    document.getElementById('notconfidentPercent').textContent = percentages.notconfident + '%';
    
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
    
    const emotionLabels = {
        notconfident: '😟 Not Confident',
        confident: '😊 Confident'
    };
    
    document.getElementById('dominantEmotion').textContent = emotionLabels[maxEmotion];
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
            emotionScores = { notconfident: 0, confident: 0 };
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