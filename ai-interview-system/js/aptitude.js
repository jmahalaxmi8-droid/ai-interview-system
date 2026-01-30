import { auth, database } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { ref, get, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

let currentUser = null;
let selectedTopic = null;
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeRemaining = 25 * 60; // 25 minutes in seconds

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (!user && !localStorage.getItem('userId')) {
        window.location.href = 'index.html';
    } else {
        currentUser = user || { uid: localStorage.getItem('userId') };
    }
});

// Topic selection
document.querySelectorAll('.topic-card').forEach(card => {
    card.addEventListener('click', async () => {
        selectedTopic = card.getAttribute('data-topic');
        await loadQuestions(selectedTopic);
        startTest();
    });
});

// Load questions from Firebase
async function loadQuestions(topic) {
    try {
        const questionsRef = ref(database, `questions/aptitude/${topic}`);
        const snapshot = await get(questionsRef);
        
        if (snapshot.exists()) {
            const allQuestions = Object.values(snapshot.val());
            // Randomly select 15 questions
            questions = shuffleArray(allQuestions).slice(0, 15);
            userAnswers = new Array(questions.length).fill(null);
        } else {
            // If no questions in database, use sample questions
            questions = getSampleQuestions(topic);
            userAnswers = new Array(questions.length).fill(null);
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        questions = getSampleQuestions(topic);
        userAnswers = new Array(questions.length).fill(null);
    }
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Sample questions (fallback)
function getSampleQuestions(topic) {
    const sampleQuestions = {
        percentage: [
            { question: "What is 15% of 200?", options: ["25", "30", "35", "40"], correct: 1 },
            { question: "If 20% of a number is 50, what is the number?", options: ["200", "250", "300", "350"], correct: 1 },
            { question: "A shirt is marked at $80 and sold at a 25% discount. What is the sale price?", options: ["$50", "$55", "$60", "$65"], correct: 2 },
            { question: "If a value increases from 500 to 650, what is the percentage increase?", options: ["25%", "30%", "35%", "40%"], correct: 1 },
            { question: "What percentage of 800 is 120?", options: ["12%", "15%", "18%", "20%"], correct: 1 },
            { question: "A student scores 85 out of 100. What is the percentage?", options: ["80%", "85%", "90%", "95%"], correct: 1 },
            { question: "If 40% of a number is 160, find 25% of the same number.", options: ["80", "90", "100", "110"], correct: 2 },
            { question: "The price of an item increased from $50 to $65. What is the percentage increase?", options: ["25%", "30%", "35%", "40%"], correct: 1 },
            { question: "What is 75% of 240?", options: ["160", "170", "180", "190"], correct: 2 },
            { question: "A value decreased from 1000 to 750. What is the percentage decrease?", options: ["20%", "25%", "30%", "35%"], correct: 1 },
            { question: "If 30% of x is 90, then x equals:", options: ["270", "280", "290", "300"], correct: 3 },
            { question: "What percent of 500 is 75?", options: ["12%", "13%", "14%", "15%"], correct: 3 },
            { question: "A number is increased by 20% and then decreased by 20%. What is the net change?", options: ["No change", "4% decrease", "4% increase", "8% decrease"], correct: 1 },
            { question: "If 45% of a number is 180, find the number.", options: ["380", "390", "400", "410"], correct: 2 },
            { question: "What is 12.5% of 800?", options: ["90", "95", "100", "105"], correct: 2 }
        ],
        probability: [
            { question: "What is the probability of getting heads when flipping a fair coin?", options: ["1/4", "1/3", "1/2", "2/3"], correct: 2 },
            { question: "A die is rolled. What is the probability of getting a number greater than 4?", options: ["1/6", "1/3", "1/2", "2/3"], correct: 1 },
            { question: "Two coins are tossed. What is the probability of getting two heads?", options: ["1/8", "1/4", "1/3", "1/2"], correct: 1 },
            { question: "A bag contains 3 red and 5 blue balls. What is the probability of drawing a red ball?", options: ["3/8", "3/5", "5/8", "5/3"], correct: 0 },
            { question: "What is the probability of drawing a king from a standard deck of cards?", options: ["1/13", "1/26", "1/52", "4/52"], correct: 0 },
            { question: "A die is rolled twice. What is the probability of getting a sum of 7?", options: ["1/6", "1/9", "1/12", "5/36"], correct: 0 },
            { question: "What is the probability of drawing a red card from a standard deck?", options: ["1/4", "1/3", "1/2", "2/3"], correct: 2 },
            { question: "Three coins are tossed. What is the probability of getting at least one head?", options: ["1/2", "5/8", "7/8", "3/4"], correct: 2 },
            { question: "A bag has 4 red, 5 blue, and 6 green balls. Probability of drawing a blue ball?", options: ["1/3", "1/4", "1/5", "2/5"], correct: 0 },
            { question: "Two dice are rolled. What is the probability of getting a sum of 11?", options: ["1/18", "1/12", "1/9", "2/9"], correct: 0 },
            { question: "A card is drawn from a deck. Probability of getting an ace or a king?", options: ["2/13", "4/13", "1/13", "8/52"], correct: 0 },
            { question: "What is the probability of getting an even number on rolling a die?", options: ["1/3", "1/2", "2/3", "1/4"], correct: 1 },
            { question: "A bag contains 7 white and 5 black balls. Probability of drawing a white ball?", options: ["5/12", "7/12", "7/5", "5/7"], correct: 1 },
            { question: "Four coins are tossed. Probability of getting exactly 2 heads?", options: ["1/4", "3/8", "1/2", "5/8"], correct: 1 },
            { question: "Two cards are drawn from a deck. Probability both are aces (without replacement)?", options: ["1/221", "4/663", "1/169", "2/221"], correct: 0 }
        ],
        mixtures: [
            { question: "Two solutions containing 20% and 40% alcohol are mixed in ratio 2:3. What is the concentration?", options: ["28%", "30%", "32%", "34%"], correct: 2 },
            { question: "In what ratio should water be mixed with milk costing $50/L to get a mixture worth $40/L?", options: ["1:4", "1:5", "1:6", "1:3"], correct: 0 },
            { question: "A 20L solution contains 15% salt. How much water should be added to make it 10% salt?", options: ["8L", "10L", "12L", "15L"], correct: 1 },
            { question: "Two types of tea worth $18/kg and $20/kg are mixed in ratio 2:3. What is the price per kg?", options: ["$18.8", "$19", "$19.2", "$19.5"], correct: 2 },
            { question: "A vessel contains 60L of 30% acid solution. How much pure acid should be added to make it 50%?", options: ["20L", "24L", "30L", "36L"], correct: 1 },
            { question: "In what ratio must water be mixed with juice costing $60/L to get a mixture costing $48/L?", options: ["1:4", "1:5", "1:3", "2:3"], correct: 0 },
            { question: "A 40L mixture of milk and water contains 10% water. How much water should be added to make it 20%?", options: ["4L", "5L", "6L", "8L"], correct: 1 },
            { question: "Two solutions of 25% and 45% concentration are mixed in ratio 3:2. Find the concentration.", options: ["32%", "33%", "34%", "35%"], correct: 1 },
            { question: "A shopkeeper mixes rice worth $30/kg and $40/kg in ratio 3:2. What is the mixture price?", options: ["$33", "$34", "$35", "$36"], correct: 1 },
            { question: "A 50L solution contains 20% alcohol. How much pure alcohol should be added to make it 30%?", options: ["5L", "7.14L", "10L", "12L"], correct: 1 },
            { question: "In what ratio should two varieties of sugar at $15/kg and $20/kg be mixed to get $18/kg?", options: ["1:2", "2:3", "3:2", "2:1"], correct: 1 },
            { question: "A 30L mixture has 25% acid. How much water to add to make it 20% acid?", options: ["5L", "7.5L", "10L", "12.5L"], correct: 1 },
            { question: "Two solutions of 30% and 60% salt are mixed equally. What is the concentration?", options: ["40%", "42%", "45%", "48%"], correct: 2 },
            { question: "A 25L solution of 40% acid is diluted with water to make it 25% acid. How much water is added?", options: ["12L", "15L", "18L", "20L"], correct: 1 },
            { question: "In what ratio should milk at $40/L be mixed with water to get a mixture worth $32/L?", options: ["3:1", "4:1", "5:1", "2:1"], correct: 1 }
        ],
        ages: [
            { question: "A father is 3 times as old as his son. After 15 years, he will be twice as old. What is the son's age?", options: ["10", "15", "20", "25"], correct: 1 },
            { question: "The sum of ages of A and B is 50. 5 years ago, A was twice as old as B. What is A's age?", options: ["30", "35", "40", "45"], correct: 1 },
            { question: "A is 5 years older than B. 10 years hence, A will be twice as old as B. What is B's current age?", options: ["3", "5", "7", "10"], correct: 1 },
            { question: "The ratio of ages of two persons is 3:4. After 5 years, it becomes 4:5. What is the younger person's age?", options: ["15", "20", "25", "30"], correct: 0 },
            { question: "A mother is 21 years older than her daughter. In 6 years, the mother will be 5 times as old. What is daughter's age?", options: ["3", "4", "5", "6"], correct: 0 },
            { question: "The average age of 3 children is 12. If ages are in ratio 3:4:5, what is the eldest child's age?", options: ["12", "15", "18", "20"], correct: 1 },
            { question: "A person's age is 4 times his son's age. In 20 years, he will be twice as old. What is the son's age?", options: ["5", "10", "15", "20"], correct: 1 },
            { question: "Sum of ages of husband and wife is 70. 5 years ago, ratio was 5:3. What is wife's age?", options: ["25", "30", "35", "40"], correct: 1 },
            { question: "A is twice as old as B. 5 years ago, A was 3 times as old as B. What is A's age?", options: ["10", "15", "20", "25"], correct: 2 },
            { question: "Ages of A and B are in ratio 5:7. After 10 years, ratio becomes 7:9. What is A's age?", options: ["15", "20", "25", "30"], correct: 2 },
            { question: "A father is 30 years older than his son. In 10 years, he will be 3 times as old. What is son's age?", options: ["5", "10", "15", "20"], correct: 0 },
            { question: "The average age of 4 people is 40. If one person leaves, average becomes 35. What was the person's age?", options: ["50", "55", "60", "65"], correct: 1 },
            { question: "A is 4 years older than B. In 8 years, A will be twice as old as B. What is B's current age?", options: ["0", "2", "4", "6"], correct: 2 },
            { question: "Ratio of ages of mother and daughter is 7:3. After 4 years, it becomes 2:1. What is mother's age?", options: ["28", "32", "35", "40"], correct: 0 },
            { question: "A man is 24 years older than his son. In 2 years, his age will be twice his son's age. What is son's age?", options: ["20", "22", "24", "26"], correct: 1 }
        ],
        calendars: [
            { question: "If January 1, 2020 was Wednesday, what day was January 1, 2021?", options: ["Thursday", "Friday", "Saturday", "Sunday"], correct: 1 },
            { question: "What day of the week was January 1, 2000?", options: ["Friday", "Saturday", "Sunday", "Monday"], correct: 1 },
            { question: "How many odd days are there in a leap year?", options: ["1", "2", "3", "4"], correct: 1 },
            { question: "If today is Monday, what day will it be after 100 days?", options: ["Monday", "Tuesday", "Wednesday", "Thursday"], correct: 1 },
            { question: "What was the day on 15th August 1947?", options: ["Thursday", "Friday", "Saturday", "Sunday"], correct: 1 },
            { question: "How many days are there from January 1 to December 31 in a non-leap year?", options: ["364", "365", "366", "367"], correct: 1 },
            { question: "If 1st January is a Sunday, what will be the last day of that year?", options: ["Saturday", "Sunday", "Monday", "Tuesday"], correct: 1 },
            { question: "What day of the week was September 28, 1970?", options: ["Sunday", "Monday", "Tuesday", "Wednesday"], correct: 1 },
            { question: "If February 29, 2020 was Saturday, what day was March 1, 2020?", options: ["Saturday", "Sunday", "Monday", "Tuesday"], correct: 1 },
            { question: "How many odd days are there in 400 years?", options: ["0", "1", "2", "3"], correct: 0 },
            { question: "If May 1 is a Friday, what day is May 31?", options: ["Friday", "Saturday", "Sunday", "Monday"], correct: 2 },
            { question: "What day will it be 90 days after Thursday?", options: ["Tuesday", "Wednesday", "Thursday", "Friday"], correct: 1 },
            { question: "If December 25, 2021 was Saturday, what day was December 25, 2022?", options: ["Saturday", "Sunday", "Monday", "Tuesday"], correct: 1 },
            { question: "How many odd days are there in 100 years?", options: ["3", "4", "5", "6"], correct: 2 },
            { question: "If your birthday falls on Sunday in 2023, what day will it be in 2024?", options: ["Sunday", "Monday", "Tuesday", "Wednesday"], correct: 1 }
        ]
    };
    
    return shuffleArray(sampleQuestions[topic] || sampleQuestions.percentage).slice(0, 15);
}

// Start test
function startTest() {
    document.getElementById('topicSelection').style.display = 'none';
    document.getElementById('testSection').style.display = 'block';
    document.getElementById('topicTitle').textContent = `Aptitude Test - ${selectedTopic.charAt(0).toUpperCase() + selectedTopic.slice(1)}`;
    
    displayQuestion();
    startTimer();
}

// Display question
function displayQuestion() {
    const question = questions[currentQuestionIndex];
    const questionContainer = document.getElementById('questionContainer');
    
    questionContainer.innerHTML = `
        <div class="question">
            <h3>Question ${currentQuestionIndex + 1}. ${question.question}</h3>
            <div class="options">
                ${question.options.map((option, index) => `
                    <div class="option ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}" 
                         onclick="selectOption(${index})">
                        ${String.fromCharCode(65 + index)}. ${option}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Update progress
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('questionNumber').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    
    // Update navigation buttons
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').textContent = currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next';
}

// Select option
window.selectOption = function(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    displayQuestion();
};

// Navigation
document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
});

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeRemaining--;
        
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            submitTest();
        }
    }, 1000);
}

// Submit test
document.getElementById('submitTest').addEventListener('click', submitTest);

async function submitTest() {
    clearInterval(timerInterval);
    
    // Calculate score
    let correctCount = 0;
    const wrongAnswers = [];
    
    questions.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
            correctCount++;
        } else {
            wrongAnswers.push({
                question: question.question,
                yourAnswer: userAnswers[index] !== null ? question.options[userAnswers[index]] : 'Not answered',
                correctAnswer: question.options[question.correct]
            });
        }
    });
    
    const percentage = Math.round((correctCount / questions.length) * 100);
    
    // Save results to Firebase
    try {
        const resultRef = ref(database, `users/${currentUser.uid}/aptitudeTests/${selectedTopic}`);
        await set(resultRef, {
            score: percentage,
            correctAnswers: correctCount,
            totalQuestions: questions.length,
            date: new Date().toISOString(),
            topic: selectedTopic
        });
    } catch (error) {
        console.error('Error saving results:', error);
    }
    
    // Display results
    displayResults(percentage, correctCount, wrongAnswers);
}

// Display results
function displayResults(percentage, correctCount, wrongAnswers) {
    document.getElementById('testSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    
    document.getElementById('scorePercentage').textContent = percentage + '%';
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('wrongCount').textContent = questions.length - correctCount;
    
    // Display wrong answers
    const reviewContainer = document.getElementById('reviewContainer');
    if (wrongAnswers.length > 0) {
        reviewContainer.innerHTML = wrongAnswers.map(item => `
            <div class="review-item">
                <div class="review-question">${item.question}</div>
                <div class="review-answer your-answer">Your Answer: ${item.yourAnswer}</div>
                <div class="review-answer correct-answer">Correct Answer: ${item.correctAnswer}</div>
            </div>
        `).join('');
    } else {
        reviewContainer.innerHTML = '<p style="text-align: center; color: #27ae60;">Perfect! All answers correct!</p>';
    }
}
