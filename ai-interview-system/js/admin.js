import { database } from './firebase-config.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Check admin authentication
if (!localStorage.getItem('isAdmin')) {
    window.location.href = 'index.html';
}

let allUsers = {};
let allPerformance = {};

// Load admin dashboard data
loadAdminData();

async function loadAdminData() {
    try {
        // Load all users
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        
        if (usersSnapshot.exists()) {
            allUsers = usersSnapshot.val();
            displayUsers();
            displayPerformance();
            calculateStatistics();
        } else {
            document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="4" class="loading">No users registered yet</td></tr>';
            document.getElementById('performanceTableBody').innerHTML = '<tr><td colspan="5" class="loading">No performance data available</td></tr>';
        }
    } catch (error) {
        console.error('Error loading admin data:', error);
        alert('Failed to load data. Please check Firebase configuration.');
    }
}

// Display users table
function displayUsers() {
    const tbody = document.getElementById('usersTableBody');
    
    const usersArray = Object.entries(allUsers).map(([uid, data]) => ({
        uid,
        ...data
    }));
    
    if (usersArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = usersArray.map(user => `
        <tr>
            <td>${user.fullName || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn-view" onclick="viewUserDetails('${user.uid}')">View Details</button>
            </td>
        </tr>
    `).join('');
}

// Display performance table
function displayPerformance() {
    const tbody = document.getElementById('performanceTableBody');
    
    const performanceArray = Object.entries(allUsers).map(([uid, data]) => {
        // Calculate aptitude average
        const aptitudeTests = data.aptitudeTests || {};
        const aptitudeScores = Object.values(aptitudeTests).map(t => t.score);
        const aptitudeAvg = aptitudeScores.length > 0 
            ? Math.round(aptitudeScores.reduce((a, b) => a + b, 0) / aptitudeScores.length)
            : 0;
        
        // Calculate technical average
        const technicalTests = data.technicalTests || {};
        const technicalScores = Object.values(technicalTests).map(t => t.score);
        const technicalAvg = technicalScores.length > 0
            ? Math.round(technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length)
            : 0;
        
        // Voice interview status
        const voiceInterviews = data.voiceInterviews || {};
        const voiceCount = Object.keys(voiceInterviews).length;
        const voiceStatus = voiceCount > 0 ? `${voiceCount} completed` : 'Not completed';
        
        // Overall status
        const overallAvg = aptitudeAvg && technicalAvg ? (aptitudeAvg + technicalAvg) / 2 : 0;
        const isEligible = overallAvg >= 60 && voiceCount > 0;
        
        return {
            uid,
            name: data.fullName || 'N/A',
            aptitudeAvg,
            technicalAvg,
            voiceStatus,
            isEligible
        };
    });
    
    if (performanceArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No performance data</td></tr>';
        return;
    }
    
    tbody.innerHTML = performanceArray.map(perf => `
        <tr>
            <td>${perf.name}</td>
            <td>${perf.aptitudeAvg > 0 ? perf.aptitudeAvg + '%' : 'N/A'}</td>
            <td>${perf.technicalAvg > 0 ? perf.technicalAvg + '%' : 'N/A'}</td>
            <td>${perf.voiceStatus}</td>
            <td>
                <span class="status-badge ${perf.isEligible ? 'eligible' : 'practice'}">
                    ${perf.isEligible ? 'Eligible' : 'Needs Practice'}
                </span>
            </td>
        </tr>
    `).join('');
}

// Calculate statistics
function calculateStatistics() {
    const totalUsers = Object.keys(allUsers).length;
    let totalTests = 0;
    let totalScore = 0;
    let testCount = 0;
    let eligibleUsers = 0;
    
    Object.values(allUsers).forEach(user => {
        // Count aptitude tests
        const aptitudeTests = user.aptitudeTests || {};
        const aptitudeCount = Object.keys(aptitudeTests).length;
        totalTests += aptitudeCount;
        
        Object.values(aptitudeTests).forEach(test => {
            totalScore += test.score;
            testCount++;
        });
        
        // Count technical tests
        const technicalTests = user.technicalTests || {};
        const technicalCount = Object.keys(technicalTests).length;
        totalTests += technicalCount;
        
        Object.values(technicalTests).forEach(test => {
            totalScore += test.score;
            testCount++;
        });
        
        // Check eligibility
        const aptitudeScores = Object.values(aptitudeTests).map(t => t.score);
        const technicalScores = Object.values(technicalTests).map(t => t.score);
        const voiceInterviews = user.voiceInterviews || {};
        
        const aptitudeAvg = aptitudeScores.length > 0 
            ? aptitudeScores.reduce((a, b) => a + b, 0) / aptitudeScores.length
            : 0;
        const technicalAvg = technicalScores.length > 0
            ? technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length
            : 0;
        const overallAvg = (aptitudeAvg + technicalAvg) / 2;
        
        if (overallAvg >= 60 && Object.keys(voiceInterviews).length > 0) {
            eligibleUsers++;
        }
    });
    
    const avgScore = testCount > 0 ? Math.round(totalScore / testCount) : 0;
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalTests').textContent = totalTests;
    document.getElementById('avgScore').textContent = avgScore + '%';
    document.getElementById('eligibleUsers').textContent = eligibleUsers;
}

// View user details
window.viewUserDetails = function(uid) {
    const user = allUsers[uid];
    if (!user) return;
    
    let detailsHTML = `
        <h3>Personal Information</h3>
        <p><strong>Name:</strong> ${user.fullName || 'N/A'}</p>
        <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
        <p><strong>Registration Date:</strong> ${user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'N/A'}</p>
        
        <h3 style="margin-top: 20px;">Aptitude Test Results</h3>
    `;
    
    const aptitudeTests = user.aptitudeTests || {};
    if (Object.keys(aptitudeTests).length > 0) {
        detailsHTML += '<ul>';
        for (let topic in aptitudeTests) {
            const test = aptitudeTests[topic];
            detailsHTML += `
                <li>
                    <strong>${topic.charAt(0).toUpperCase() + topic.slice(1)}:</strong> 
                    ${test.score}% (${test.correctAnswers}/${test.totalQuestions}) - 
                    ${new Date(test.date).toLocaleDateString()}
                </li>
            `;
        }
        detailsHTML += '</ul>';
    } else {
        detailsHTML += '<p>No aptitude tests completed</p>';
    }
    
    detailsHTML += '<h3 style="margin-top: 20px;">Technical Test Results</h3>';
    
    const technicalTests = user.technicalTests || {};
    if (Object.keys(technicalTests).length > 0) {
        detailsHTML += '<ul>';
        for (let topic in technicalTests) {
            const test = technicalTests[topic];
            detailsHTML += `
                <li>
                    <strong>${topic.toUpperCase()}:</strong> 
                    ${test.score}% (${test.correctAnswers}/${test.totalQuestions}) - 
                    ${new Date(test.date).toLocaleDateString()}
                </li>
            `;
        }
        detailsHTML += '</ul>';
    } else {
        detailsHTML += '<p>No technical tests completed</p>';
    }
    
    detailsHTML += '<h3 style="margin-top: 20px;">Voice Interview Results</h3>';
    
    const voiceInterviews = user.voiceInterviews || {};
    if (Object.keys(voiceInterviews).length > 0) {
        detailsHTML += `<p><strong>Interviews Completed:</strong> ${Object.keys(voiceInterviews).length}</p>`;
        detailsHTML += '<ul>';
        for (let timestamp in voiceInterviews) {
            const interview = voiceInterviews[timestamp];
            detailsHTML += `
                <li>
                    <strong>Date:</strong> ${new Date(interview.date).toLocaleDateString()} - 
                    <strong>Dominant Emotion:</strong> ${interview.dominantEmotion}
                </li>
            `;
        }
        detailsHTML += '</ul>';
    } else {
        detailsHTML += '<p>No voice interviews completed</p>';
    }
    
    document.getElementById('modalUserName').textContent = user.fullName || 'User Details';
    document.getElementById('userDetailsContent').innerHTML = detailsHTML;
    document.getElementById('userDetailsModal').style.display = 'block';
};

// Modal close functionality
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('userDetailsModal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('userDetailsModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Logout functionality
document.getElementById('adminLogoutBtn').addEventListener('click', () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
});
