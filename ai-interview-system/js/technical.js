import { auth, database } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { ref, get, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

let currentUser = null;
let selectedTopic = null;
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeRemaining = 25 * 60;

onAuthStateChanged(auth, (user) => {
    if (!user && !localStorage.getItem('userId')) {
        window.location.href = 'index.html';
    } else {
        currentUser = user || { uid: localStorage.getItem('userId') };
    }
});

document.querySelectorAll('.topic-card').forEach(card => {
    card.addEventListener('click', async () => {
        selectedTopic = card.getAttribute('data-topic');
        await loadQuestions(selectedTopic);
        startTest();
    });
});

async function loadQuestions(topic) {
    try {
        const questionsRef = ref(database, `questions/technical/${topic}`);
        const snapshot = await get(questionsRef);
        
        if (snapshot.exists()) {
            const allQuestions = Object.values(snapshot.val());
            questions = shuffleArray(allQuestions).slice(0, 15);
            userAnswers = new Array(questions.length).fill(null);
        } else {
            questions = getSampleQuestions(topic);
            userAnswers = new Array(questions.length).fill(null);
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        questions = getSampleQuestions(topic);
        userAnswers = new Array(questions.length).fill(null);
    }
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getSampleQuestions(topic) {
    const sampleQuestions = {
        html: [
            { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"], correct: 0 },
            { question: "Which HTML tag is used to define an internal style sheet?", options: ["<css>", "<script>", "<style>", "<link>"], correct: 2 },
            { question: "Which is the correct HTML element for the largest heading?", options: ["<heading>", "<h6>", "<h1>", "<head>"], correct: 2 },
            { question: "What is the correct HTML element for inserting a line break?", options: ["<lb>", "<break>", "<br>", "<newline>"], correct: 2 },
            { question: "Which HTML attribute specifies an alternate text for an image?", options: ["title", "src", "alt", "longdesc"], correct: 2 },
            { question: "What is the correct HTML for creating a hyperlink?", options: ["<a url='url'>", "<a href='url'>", "<a name='url'>", "<link='url'>"], correct: 1 },
            { question: "How can you make a numbered list?", options: ["<ul>", "<ol>", "<dl>", "<list>"], correct: 1 },
            { question: "What is the correct HTML for making a checkbox?", options: ["<check>", "<checkbox>", "<input type='check'>", "<input type='checkbox'>"], correct: 3 },
            { question: "Which HTML element defines the title of a document?", options: ["<meta>", "<title>", "<head>", "<header>"], correct: 1 },
            { question: "Which HTML attribute is used to define inline styles?", options: ["class", "style", "font", "styles"], correct: 1 },
            { question: "What is the correct HTML for making a text input field?", options: ["<input type='text'>", "<textfield>", "<textinput>", "<input type='textfield'>"], correct: 0 },
            { question: "Which HTML element is used to specify a footer for a document?", options: ["<bottom>", "<section>", "<footer>", "<end>"], correct: 2 },
            { question: "What is the correct HTML for inserting an image?", options: ["<img href='image.jpg'>", "<image src='image.jpg'>", "<img src='image.jpg'>", "<img='image.jpg'>"], correct: 2 },
            { question: "Which HTML element defines navigation links?", options: ["<navigation>", "<nav>", "<navigate>", "<links>"], correct: 1 },
            { question: "What is the correct HTML for making a drop-down list?", options: ["<list>", "<select>", "<dropdown>", "<input type='list'>"], correct: 1 }
        ],
        java: [
            { question: "Which of these is not a Java feature?", options: ["Object-oriented", "Use of pointers", "Portable", "Dynamic"], correct: 1 },
            { question: "What is the size of int in Java?", options: ["16 bit", "32 bit", "64 bit", "Depends on system"], correct: 1 },
            { question: "Which keyword is used for accessing the features of a package?", options: ["package", "import", "extends", "export"], correct: 1 },
            { question: "What is the default value of a boolean variable in Java?", options: ["true", "false", "0", "null"], correct: 1 },
            { question: "Which of these is not a primitive data type in Java?", options: ["int", "float", "boolean", "String"], correct: 3 },
            { question: "Which method must be implemented by all threads?", options: ["wait()", "start()", "run()", "resume()"], correct: 2 },
            { question: "Which of these keywords is used to define interfaces in Java?", options: ["intf", "interface", "Intf", "Interface"], correct: 1 },
            { question: "What is the return type of the hashCode() method?", options: ["int", "Object", "long", "void"], correct: 0 },
            { question: "Which package contains the Random class?", options: ["java.util", "java.lang", "java.io", "java.awt"], correct: 0 },
            { question: "Which of these is a valid long literal?", options: ["ABH8097", "L990023", "904423", "0xnf029L"], correct: 3 },
            { question: "What is the process of defining a method in a subclass having same name as in parent?", options: ["Overloading", "Overriding", "Abstraction", "Encapsulation"], correct: 1 },
            { question: "Which keyword is used to prevent method overriding?", options: ["static", "final", "constant", "abstract"], correct: 1 },
            { question: "Which of these is used to handle exceptions?", options: ["try-catch", "if-else", "switch-case", "for-loop"], correct: 0 },
            { question: "What is the extension of java code files?", options: [".js", ".txt", ".class", ".java"], correct: 3 },
            { question: "Which operator is used to allocate memory to array?", options: ["malloc", "alloc", "new", "calloc"], correct: 2 }
        ],
        css: [
            { question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], correct: 1 },
            { question: "Which HTML attribute is used to define inline styles?", options: ["class", "style", "font", "styles"], correct: 1 },
            { question: "Which is the correct CSS syntax?", options: ["body {color: black;}", "{body;color:black;}", "body:color=black;", "{body:color=black;}"], correct: 0 },
            { question: "How do you insert a comment in a CSS file?", options: ["// this is a comment", "/* this is a comment */", "' this is a comment", "// this is a comment //"], correct: 1 },
            { question: "Which property is used to change the background color?", options: ["color", "bgcolor", "background-color", "bg-color"], correct: 2 },
            { question: "How do you add a background color for all <h1> elements?", options: ["all.h1 {background-color:#FFFFFF;}", "h1.all {background-color:#FFFFFF;}", "h1 {background-color:#FFFFFF;}", "all h1 {background-color:#FFFFFF;}"], correct: 2 },
            { question: "Which CSS property controls the text size?", options: ["font-size", "text-size", "font-style", "text-style"], correct: 0 },
            { question: "What is the correct CSS syntax for making all the <p> elements bold?", options: ["p {text-size:bold;}", "p {font-weight:bold;}", "<p style='text-size:bold;'>", "p {font-size:bold;}"], correct: 1 },
            { question: "How do you display hyperlinks without an underline?", options: ["a {text-decoration:none;}", "a {underline:none;}", "a {decoration:no-underline;}", "a {text-decoration:no-underline;}"], correct: 0 },
            { question: "How do you make each word in a text start with a capital letter?", options: ["text-transform:capitalize", "text-style:capitalize", "transform:capitalize", "text-capitalize:true"], correct: 0 },
            { question: "Which property is used to change the font of an element?", options: ["font-weight", "font-style", "font-family", "font-size"], correct: 2 },
            { question: "How do you make the text bold?", options: ["font-weight:bold;", "style:bold;", "font:bold;", "text:bold;"], correct: 0 },
            { question: "Which CSS property is used to change the text color of an element?", options: ["fgcolor", "text-color", "color", "font-color"], correct: 2 },
            { question: "Which CSS property controls the space between the element's border and content?", options: ["margin", "padding", "spacing", "border-spacing"], correct: 1 },
            { question: "What is the default value of the position property?", options: ["relative", "fixed", "absolute", "static"], correct: 3 }
        ],
        php: [
            { question: "What does PHP stand for?", options: ["Personal Home Page", "PHP: Hypertext Preprocessor", "Private Home Page", "Public Hypertext Preprocessor"], correct: 1 },
            { question: "All variables in PHP start with which symbol?", options: ["!", "$", "#", "&"], correct: 1 },
            { question: "Which version of PHP introduced Try/catch Exception?", options: ["PHP 4", "PHP 5", "PHP 6", "PHP 7"], correct: 1 },
            { question: "If $a = 12 what will be returned when ($a == 12) ? 5 : 1 is executed?", options: ["12", "1", "5", "error"], correct: 2 },
            { question: "Which of the following is the correct way to create an array in PHP?", options: ["$array = array();", "$array = []", "Both A and B", "None"], correct: 2 },
            { question: "Which function is used to check if a file exists?", options: ["file_exists()", "is_file()", "check_file()", "exists()"], correct: 0 },
            { question: "What is the correct way to end a PHP statement?", options: [".", ";", ":", "None"], correct: 1 },
            { question: "Which PHP function returns the number of elements in an array?", options: ["len()", "count()", "length()", "size()"], correct: 1 },
            { question: "How do you write 'Hello World' in PHP?", options: ["echo 'Hello World';", "print('Hello World');", "document.write('Hello World');", "Both A and B"], correct: 3 },
            { question: "Which superglobal variable holds information about headers, paths, and script locations?", options: ["$_SERVER", "$_ENV", "$_REQUEST", "$_GET"], correct: 0 },
            { question: "Which operator is used to concatenate strings in PHP?", options: ["+", ".", "&", "*"], correct: 1 },
            { question: "Which function is used to include a file in PHP?", options: ["import()", "require()", "add()", "link()"], correct: 1 },
            { question: "Which symbol is used for single line comments in PHP?", options: ["/*", "//", "#", "Both B and C"], correct: 3 },
            { question: "What is the correct way to create a function in PHP?", options: ["function myFunction()", "create myFunction()", "new function myFunction()", "def myFunction()"], correct: 0 },
            { question: "Which function is used to redirect to another page?", options: ["redirect()", "header()", "goto()", "move()"], correct: 1 }
        ],
        python: [
            { question: "Which of the following is used to define a block of code in Python?", options: ["Brackets", "Indentation", "Key", "None"], correct: 1 },
            { question: "What is the output of print(2**3)?", options: ["6", "8", "9", "5"], correct: 1 },
            { question: "Which keyword is used for function in Python?", options: ["Function", "def", "fun", "define"], correct: 1 },
            { question: "Which of these is not a core data type in Python?", options: ["Lists", "Dictionary", "Tuples", "Class"], correct: 3 },
            { question: "What is the maximum length of a Python identifier?", options: ["16", "32", "64", "No fixed length"], correct: 3 },
            { question: "Which method is used to remove whitespace from the beginning and end of a string?", options: ["strip()", "trim()", "len()", "remove()"], correct: 0 },
            { question: "What is the output of print(type([]))?", options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'dict'>"], correct: 0 },
            { question: "Which operator is used for floor division in Python?", options: ["/", "//", "%", "**"], correct: 1 },
            { question: "What is used to define a class in Python?", options: ["def", "class", "struct", "object"], correct: 1 },
            { question: "Which function is used to get the length of a list?", options: ["length()", "size()", "len()", "count()"], correct: 2 },
            { question: "What is the output of print('Hello'[1])?", options: ["H", "e", "l", "o"], correct: 1 },
            { question: "Which statement is used to exit a loop?", options: ["exit", "break", "return", "stop"], correct: 1 },
            { question: "What does the range(5) function return?", options: ["[1,2,3,4,5]", "[0,1,2,3,4]", "[0,1,2,3,4,5]", "[1,2,3,4]"], correct: 1 },
            { question: "Which method is used to add an element at the end of a list?", options: ["add()", "append()", "insert()", "extend()"], correct: 1 },
            { question: "What is the correct file extension for Python files?", options: [".pt", ".pyt", ".py", ".python"], correct: 2 }
        ],
        sql: [
            { question: "What does SQL stand for?", options: ["Structured Query Language", "Strong Question Language", "Structured Question Language", "Strong Query Language"], correct: 0 },
            { question: "Which SQL statement is used to extract data from a database?", options: ["EXTRACT", "GET", "SELECT", "OPEN"], correct: 2 },
            { question: "Which SQL statement is used to update data in a database?", options: ["MODIFY", "UPDATE", "SAVE AS", "SAVE"], correct: 1 },
            { question: "Which SQL statement is used to delete data from a database?", options: ["REMOVE", "DELETE", "COLLAPSE", "DROP"], correct: 1 },
            { question: "Which SQL statement is used to insert new data in a database?", options: ["ADD NEW", "INSERT INTO", "ADD RECORD", "INSERT NEW"], correct: 1 },
            { question: "With SQL, how do you select a column named 'FirstName' from a table named 'Persons'?", options: ["SELECT FirstName FROM Persons", "EXTRACT FirstName FROM Persons", "SELECT Persons.FirstName", "GET FirstName FROM Persons"], correct: 0 },
            { question: "With SQL, how do you select all the columns from a table named 'Persons'?", options: ["SELECT *.Persons", "SELECT [all] FROM Persons", "SELECT * FROM Persons", "SELECT Persons"], correct: 2 },
            { question: "With SQL, how can you return the number of records in the 'Persons' table?", options: ["SELECT COUNT(*) FROM Persons", "SELECT COLUMNS(*) FROM Persons", "SELECT NO(*) FROM Persons", "SELECT LEN(*) FROM Persons"], correct: 0 },
            { question: "Which SQL keyword is used to sort the result-set?", options: ["SORT BY", "ORDER", "ORDER BY", "SORT"], correct: 2 },
            { question: "With SQL, how can you return all the records from a table where the 'FirstName' is 'Peter'?", options: ["SELECT * FROM Persons WHERE FirstName='Peter'", "SELECT [all] FROM Persons WHERE FirstName='Peter'", "SELECT * FROM Persons WHERE FirstName LIKE 'Peter'", "SELECT * FROM Persons WHERE FirstName<>'Peter'"], correct: 0 },
            { question: "Which SQL statement is used to create a table?", options: ["CREATE TABLE", "CREATE DATABASE", "MAKE TABLE", "NEW TABLE"], correct: 0 },
            { question: "Which SQL keyword is used to retrieve a maximum value?", options: ["TOP", "MAX", "UPPER", "MAXIMUM"], correct: 1 },
            { question: "Which operator is used to search for a specified pattern in a column?", options: ["GET", "FROM", "LIKE", "SEARCH"], correct: 2 },
            { question: "The OR operator displays a record if ANY conditions listed are true. The AND operator displays a record if:", options: ["One condition is true", "All conditions are true", "Both A and B", "None"], correct: 1 },
            { question: "Which SQL statement is used to create an index?", options: ["CREATE INDEX", "MAKE INDEX", "INDEX", "NEW INDEX"], correct: 0 }
        ]
    };
    
    return shuffleArray(sampleQuestions[topic] || sampleQuestions.html).slice(0, 15);
}

function startTest() {
    document.getElementById('topicSelection').style.display = 'none';
    document.getElementById('testSection').style.display = 'block';
    document.getElementById('topicTitle').textContent = `Technical Interview - ${selectedTopic.toUpperCase()}`;
    
    displayQuestion();
    startTimer();
}

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
    
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('questionNumber').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').textContent = currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next';
}

window.selectOption = function(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    displayQuestion();
};

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

document.getElementById('submitTest').addEventListener('click', submitTest);

async function submitTest() {
    clearInterval(timerInterval);
    
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
    
    try {
        const resultRef = ref(database, `users/${currentUser.uid}/technicalTests/${selectedTopic}`);
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
    
    displayResults(percentage, correctCount, wrongAnswers);
}

function displayResults(percentage, correctCount, wrongAnswers) {
    document.getElementById('testSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    
    document.getElementById('scorePercentage').textContent = percentage + '%';
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('wrongCount').textContent = questions.length - correctCount;
    
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
