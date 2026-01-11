// Configuration - Replace with your Google Sheet URL
// Format: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/gviz/tq?tqx=out:json&sheet=YOUR_SHEET_NAME
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1ZtGuC4mhdIvUbLa-3wRoe74rOqV9Ls0ZKcHukr60hXM/edit?usp=sharing';

// State management
let currentQuestions = [];
let currentQuestionIndex = 0;
let selectedQuestions = [];

// DOM elements
const landingScreen = document.getElementById('landingScreen');
const loadingScreen = document.getElementById('loadingScreen');
const noQuestionsScreen = document.getElementById('noQuestionsScreen');
const quizScreen = document.getElementById('quizScreen');
const rewardScreen = document.getElementById('rewardScreen');
const lockScreen = document.getElementById('lockScreen');

const startButton = document.getElementById('startButton');
const backToLandingButton1 = document.getElementById('backToLandingButton1');
const backToLandingButton2 = document.getElementById('backToLandingButton2');
const progressText = document.getElementById('progressText');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const feedbackMessage = document.getElementById('feedbackMessage');

// Utility functions
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getStoredCompletionDate() {
    return localStorage.getItem('roseCompletionDate');
}

function setStoredCompletionDate(date) {
    localStorage.setItem('roseCompletionDate', date);
}

function hasCompletedToday() {
    const storedDate = getStoredCompletionDate();
    const today = getTodayDate();
    return storedDate === today;
}

// Google Sheets fetching
async function fetchQuestionsFromGoogleSheet() {
    try {
        if (GOOGLE_SHEET_URL === 'YOUR_GOOGLE_SHEET_URL_HERE') {
            throw new Error('Please configure your Google Sheet URL in script.js');
        }

        // Convert Google Sheets URL to JSON export URL
        let sheetUrl = GOOGLE_SHEET_URL.trim();
        
        // Handle different URL formats
        if (sheetUrl.includes('/edit')) {
            sheetUrl = sheetUrl.replace('/edit', '/gviz/tq?tqx=out:json');
        } else if (!sheetUrl.includes('/gviz/tq')) {
            // Extract sheet ID from URL
            const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
            if (match) {
                const sheetId = match[1];
                sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
            } else {
                throw new Error('Invalid Google Sheet URL format');
            }
        }

        const response = await fetch(sheetUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch Google Sheet: ${response.status}`);
        }
        
        const text = await response.text();
        
        // Remove the prefix "google.visualization.Query.setResponse(" and suffix ");"
        const jsonStart = text.indexOf('(');
        const jsonEnd = text.lastIndexOf(')');
        
        if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error('Invalid response format from Google Sheets');
        }
        
        const jsonText = text.substring(jsonStart + 1, jsonEnd);
        const data = JSON.parse(jsonText);

        // Parse the Google Sheets data
        if (!data.table || !data.table.rows) {
            throw new Error('Invalid data structure from Google Sheets');
        }

        const rows = data.table.rows;
        const questions = [];

        // Skip header row (index 0) and parse data rows
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.c;
            
            if (cells && cells.length >= 7) {
                const date = cells[0]?.v || '';
                const question = cells[1]?.v || '';
                const optionA = cells[2]?.v || '';
                const optionB = cells[3]?.v || '';
                const optionC = cells[4]?.v || '';
                const optionD = cells[5]?.v || '';
                const correctOption = cells[6]?.v || '';

                // Validate that all fields are present
                if (date && question && optionA && optionB && optionC && optionD && correctOption) {
                    // Validate correctOption format
                    const upperCorrect = correctOption.toString().toUpperCase().trim();
                    if (['A', 'B', 'C', 'D'].includes(upperCorrect)) {
                        questions.push({
                            date: date.toString().trim(),
                            question: question.toString().trim(),
                            optionA: optionA.toString().trim(),
                            optionB: optionB.toString().trim(),
                            optionC: optionC.toString().trim(),
                            optionD: optionD.toString().trim(),
                            correctOption: upperCorrect
                        });
                    }
                }
            }
        }

        return questions;
    } catch (error) {
        console.error('Error fetching questions:', error);
        throw error;
    }
}

function filterTodayQuestions(questions) {
    const today = getTodayDate();
    return questions.filter(q => q.date === today);
}

function selectRandomQuestions(questions, count = 5) {
    if (questions.length <= count) {
        return questions;
    }
    
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Screen management
function showScreen(screen) {
    landingScreen.classList.add('hidden');
    loadingScreen.classList.add('hidden');
    noQuestionsScreen.classList.add('hidden');
    quizScreen.classList.add('hidden');
    rewardScreen.classList.add('hidden');
    lockScreen.classList.add('hidden');
    
    screen.classList.remove('hidden');
}

function showLoading() {
    showScreen(loadingScreen);
}

function showLanding() {
    showScreen(landingScreen);
}

function showNoQuestions() {
    showScreen(noQuestionsScreen);
}

function showQuiz() {
    showScreen(quizScreen);
}

function showReward() {
    showScreen(rewardScreen);
}

function showLock() {
    showScreen(lockScreen);
}

// Quiz logic
function renderQuestion() {
    const question = selectedQuestions[currentQuestionIndex];
    
    // Update progress
    progressText.textContent = `Question ${currentQuestionIndex + 1} of 5`;
    
    // Update question text
    questionText.textContent = question.question;
    
    // Clear options
    optionsContainer.innerHTML = '';
    feedbackMessage.classList.add('hidden');
    
    // Create option buttons
    const options = [
        { key: 'A', text: question.optionA },
        { key: 'B', text: question.optionB },
        { key: 'C', text: question.optionC },
        { key: 'D', text: question.optionD }
    ];
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = `${option.key}. ${option.text}`;
        button.addEventListener('click', () => handleAnswer(option.key));
        optionsContainer.appendChild(button);
    });
}

function handleAnswer(selectedOption) {
    const question = selectedQuestions[currentQuestionIndex];
    const isCorrect = selectedOption.toUpperCase() === question.correctOption.toUpperCase();
    
    if (isCorrect) {
        // Correct answer - move to next question
        currentQuestionIndex++;
        
        if (currentQuestionIndex < selectedQuestions.length) {
            // More questions to go
            setTimeout(() => {
                renderQuestion();
            }, 300);
        } else {
            // All questions answered correctly
            handleQuizCompletion();
        }
    } else {
        // Wrong answer - show feedback
        feedbackMessage.classList.remove('hidden');
    }
}

function handleQuizCompletion() {
    // Mark today as completed
    setStoredCompletionDate(getTodayDate());
    
    // Show reward screen after a short delay
    setTimeout(() => {
        showReward();
    }, 500);
}

// Event listeners
startButton.addEventListener('click', async () => {
    // Check if already completed today
    if (hasCompletedToday()) {
        showLock();
        return;
    }
    
    showLoading();
    
    try {
        // Fetch questions from Google Sheet
        const allQuestions = await fetchQuestionsFromGoogleSheet();
        
        // Filter questions for today
        const todayQuestions = filterTodayQuestions(allQuestions);
        
        if (todayQuestions.length === 0) {
            showNoQuestions();
            return;
        }
        
        // Select 5 random questions
        selectedQuestions = selectRandomQuestions(todayQuestions, 5);
        
        // Reset quiz state
        currentQuestionIndex = 0;
        
        // Show quiz
        setTimeout(() => {
            showQuiz();
            renderQuestion();
        }, 500);
        
    } catch (error) {
        console.error('Error loading quiz:', error);
        // Show error message - in production, you might want a better error screen
        alert('Error loading questions. Please check your Google Sheet configuration.');
        showLanding();
    }
});

backToLandingButton1.addEventListener('click', () => {
    showLanding();
});

backToLandingButton2.addEventListener('click', () => {
    showLanding();
});

// Check on page load if already completed today
window.addEventListener('load', () => {
    if (hasCompletedToday()) {
        showLock();
    } else {
        showLanding();
    }
});
