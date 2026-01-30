import { auth, database } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

let currentUser = null;
let aptitudeData = {};
let technicalData = {};
let voiceData = [];

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (!user && !localStorage.getItem('userId')) {
        window.location.href = 'index.html';
    } else {
        currentUser = user || { uid: localStorage.getItem('userId') };
        loadResults();
    }
});

// Load all results
async function loadResults() {
    try {
        // Load aptitude test results
        const aptitudeRef = ref(database, `users/${currentUser.uid}/aptitudeTests`);
        const aptitudeSnapshot = await get(aptitudeRef);
        if (aptitudeSnapshot.exists()) {
            aptitudeData = aptitudeSnapshot.val();
        }
        
        // Load technical test results
        const technicalRef = ref(database, `users/${currentUser.uid}/technicalTests`);
        const technicalSnapshot = await get(technicalRef);
        if (technicalSnapshot.exists()) {
            technicalData = technicalSnapshot.val();
        }
        
        // Load voice interview results
        const voiceRef = ref(database, `users/${currentUser.uid}/voiceInterviews`);
        const voiceSnapshot = await get(voiceRef);
        if (voiceSnapshot.exists()) {
            voiceData = Object.values(voiceSnapshot.val());
        }
        
        // Display results
        displayResults();
    } catch (error) {
        console.error('Error loading results:', error);
        document.getElementById('overallStatus').textContent = 'Error Loading Results';
        document.getElementById('statusMessage').textContent = 'Please try again later';
    }
}

// Display all results
function displayResults() {
    // Calculate overall performance
    const aptitudeAvg = calculateAverage(aptitudeData);
    const technicalAvg = calculateAverage(technicalData);
    const voiceStatus = voiceData.length > 0;
    
    // Determine eligibility
    const overallAvg = (aptitudeAvg + technicalAvg) / 2;
    const isEligible = overallAvg >= 60 && voiceStatus;
    
    // Display overall status
    const statusCard = document.getElementById('statusCard');
    const overallStatus = document.getElementById('overallStatus');
    const statusMessage = document.getElementById('statusMessage');
    
    if (isEligible) {
        statusCard.classList.add('eligible');
        overallStatus.textContent = '✓ Eligible to Work';
        statusMessage.textContent = `Congratulations! Your overall performance is ${Math.round(overallAvg)}%. You are eligible for the position.`;
    } else {
        statusCard.classList.add('practice');
        overallStatus.textContent = '⚠ Needs More Practice';
        statusMessage.textContent = `Your overall performance is ${Math.round(overallAvg)}%. Keep practicing to improve your skills.`;
    }
    
    // Create charts
    createPerformanceChart(aptitudeAvg, technicalAvg);
    createCategoryChart();
    
    // Display detailed results
    displayDetailedResults();
    
    // Display recommendations
    displayRecommendations(aptitudeAvg, technicalAvg, voiceStatus);
}

// Calculate average score
function calculateAverage(data) {
    const scores = Object.values(data).map(item => item.score);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
}

// Create performance chart
function createPerformanceChart(aptitudeAvg, technicalAvg) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Aptitude Tests', 'Technical Tests', 'Overall'],
            datasets: [{
                label: 'Score (%)',
                data: [aptitudeAvg, technicalAvg, (aptitudeAvg + technicalAvg) / 2],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(39, 174, 96, 0.8)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(118, 75, 162, 1)',
                    'rgba(39, 174, 96, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
}

// Create category chart
function createCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    const allCategories = [];
    const allScores = [];
    
    // Add aptitude scores
    for (let topic in aptitudeData) {
        allCategories.push(topic.charAt(0).toUpperCase() + topic.slice(1));
        allScores.push(aptitudeData[topic].score);
    }
    
    // Add technical scores
    for (let topic in technicalData) {
        allCategories.push(topic.toUpperCase());
        allScores.push(technicalData[topic].score);
    }
    
    if (allCategories.length === 0) {
        allCategories.push('No Data');
        allScores.push(0);
    }
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: allCategories,
            datasets: [{
                data: allScores,
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(39, 174, 96, 0.8)',
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(243, 156, 18, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(26, 188, 156, 0.8)',
                    'rgba(230, 126, 34, 0.8)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

// Display detailed results
function displayDetailedResults() {
    // Aptitude results
    const aptitudeContainer = document.getElementById('aptitudeResults');
    if (Object.keys(aptitudeData).length > 0) {
        aptitudeContainer.innerHTML = Object.entries(aptitudeData).map(([topic, data]) => `
            <div class="result-item">
                <span class="result-topic">${topic.charAt(0).toUpperCase() + topic.slice(1)}</span>
                <span class="result-score ${getScoreClass(data.score)}">${data.score}%</span>
            </div>
        `).join('');
    } else {
        aptitudeContainer.innerHTML = '<p style="color: #999;">No aptitude tests completed yet</p>';
    }
    
    // Technical results
    const technicalContainer = document.getElementById('technicalResults');
    if (Object.keys(technicalData).length > 0) {
        technicalContainer.innerHTML = Object.entries(technicalData).map(([topic, data]) => `
            <div class="result-item">
                <span class="result-topic">${topic.toUpperCase()}</span>
                <span class="result-score ${getScoreClass(data.score)}">${data.score}%</span>
            </div>
        `).join('');
    } else {
        technicalContainer.innerHTML = '<p style="color: #999;">No technical tests completed yet</p>';
    }
    
    // Voice results
    const voiceContainer = document.getElementById('voiceResults');
    if (voiceData.length > 0) {
        const latestVoice = voiceData[voiceData.length - 1];
        voiceContainer.innerHTML = `
            <div class="result-item">
                <span class="result-topic">Dominant Emotion</span>
                <span class="result-score good">${latestVoice.dominantEmotion.charAt(0).toUpperCase() + latestVoice.dominantEmotion.slice(1)}</span>
            </div>
            <div class="result-item">
                <span class="result-topic">Interviews Completed</span>
                <span class="result-score good">${voiceData.length}</span>
            </div>
        `;
    } else {
        voiceContainer.innerHTML = '<p style="color: #999;">No voice interviews completed yet</p>';
    }
}

// Get score class for styling
function getScoreClass(score) {
    if (score >= 80) return 'good';
    if (score >= 60) return 'average';
    return 'poor';
}

// Display recommendations
function displayRecommendations(aptitudeAvg, technicalAvg, voiceStatus) {
    const recommendations = [];
    
    if (aptitudeAvg < 60) {
        recommendations.push('Practice more aptitude questions, especially in areas where you scored below 60%');
    }
    
    if (technicalAvg < 60) {
        recommendations.push('Strengthen your technical knowledge through online courses and practice');
    }
    
    if (!voiceStatus) {
        recommendations.push('Complete at least one voice interview to demonstrate your communication skills');
    }
    
    if (aptitudeAvg >= 60 && technicalAvg >= 60 && voiceStatus) {
        recommendations.push('Excellent work! Continue practicing to maintain your skills');
        recommendations.push('Consider taking advanced tests in specific areas to further improve');
    }
    
    if (Object.keys(aptitudeData).length < 3) {
        recommendations.push('Take more aptitude tests in different topics to improve overall score');
    }
    
    if (Object.keys(technicalData).length < 3) {
        recommendations.push('Explore more technical topics to broaden your knowledge base');
    }
    
    const recommendationsContainer = document.getElementById('recommendations');
    if (recommendations.length > 0) {
        recommendationsContainer.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                ${rec}
            </div>
        `).join('');
    } else {
        recommendationsContainer.innerHTML = '<p style="color: #999;">Complete some tests to get personalized recommendations</p>';
    }
}
