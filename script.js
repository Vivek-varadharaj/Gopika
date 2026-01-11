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
const flipContainer = document.getElementById('flipContainer');
let answerText = document.getElementById('answerText');
const nextButton = document.getElementById('nextButton');

// Tap to reveal state
let isRevealed = false;
const questionContainer = document.querySelector('.question-container');

// Utility functions
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseGoogleSheetsDate(dateValue) {
    // Handle Date objects directly
    if (dateValue instanceof Date) {
        const year = dateValue.getFullYear();
        const month = String(dateValue.getMonth() + 1).padStart(2, '0');
        const day = String(dateValue.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Handle Date string format: "Date(2026,0,11)"
    const dateStr = dateValue.toString();
    const dateMatch = dateStr.match(/Date\((\d+),(\d+),(\d+)\)/);
    if (dateMatch) {
        const year = parseInt(dateMatch[1], 10);
        const month = String(parseInt(dateMatch[2], 10) + 1).padStart(2, '0'); // Month is 0-indexed
        const day = String(parseInt(dateMatch[3], 10)).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Handle numeric date (Google Sheets serial date format)
    if (typeof dateValue === 'number') {
        // Google Sheets epoch is December 30, 1899
        const epoch = new Date(1899, 11, 30);
        const date = new Date(epoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // If it's already in YYYY-MM-DD format, return as is
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue.trim())) {
        return dateValue.trim();
    }
    
    // Fallback: try to parse as regular date string
    try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    } catch (e) {
        // Ignore parse errors
    }
    
    // Last resort: return as string
    return dateValue.toString().trim();
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
            // Remove query parameters and replace /edit with JSON export endpoint
            sheetUrl = sheetUrl.split('?')[0].replace('/edit', '/gviz/tq?tqx=out:json');
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
            
            if (!cells || cells.length < 7) {
                continue;
            }
            
            const dateValue = cells[0]?.v;
            const question = cells[1]?.v || '';
            const optionA = cells[2]?.v || '';
            const optionB = cells[3]?.v || '';
            const optionC = cells[4]?.v || '';
            const optionD = cells[5]?.v || '';
            const correctOption = cells[6]?.v || '';

            // Skip if any essential field is missing
            if (!dateValue || !question || !optionA || !optionB || !optionC || !optionD || !correctOption) {
                continue;
            }

            // Parse and format the date
            const date = parseGoogleSheetsDate(dateValue);
            
            // Validate correctOption format
            const upperCorrect = correctOption.toString().toUpperCase().trim();
            if (!['A', 'B', 'C', 'D'].includes(upperCorrect)) {
                continue;
            }
            
            // All validations passed - add the question
            questions.push({
                date: date,
                question: question.toString().trim(),
                optionA: optionA.toString().trim(),
                optionB: optionB.toString().trim(),
                optionC: optionC.toString().trim(),
                optionD: optionD.toString().trim(),
                correctOption: upperCorrect
            });
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
    // Validate we have a question
    if (!selectedQuestions || selectedQuestions.length === 0 || currentQuestionIndex >= selectedQuestions.length) {
        console.error('No question available at index:', currentQuestionIndex);
        return;
    }
    
    const question = selectedQuestions[currentQuestionIndex];
    if (!question) {
        console.error('Question is undefined at index:', currentQuestionIndex);
        return;
    }
    
    const questionContainer = document.querySelector('.question-container');
    
    // Update progress
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${selectedQuestions.length}`;
    
    // Update question text
    questionText.textContent = question.question;
    
    // Get the correct answer text
    const correctAnswer = question[`option${question.correctOption}`];
    
    // Reset state
    nextButton.classList.add('hidden');
    isRevealed = false;
    
    // Reset flip card
    if (flipContainer) {
        const card = flipContainer.querySelector('.flip-card');
        if (card) {
            card.classList.remove('flipped');
        }
    }
    
    // Add fade-in animation (only if not the first question)
    if (questionContainer) {
        questionContainer.classList.remove('fade-out');
        // Only animate if this is not the initial render (when currentQuestionIndex > 0)
        if (currentQuestionIndex > 0) {
            questionContainer.classList.add('fade-in');
            // Remove fade-in class after animation completes to allow re-animation
            setTimeout(() => {
                questionContainer.classList.remove('fade-in');
            }, 400);
        } else {
            // First question - ensure it's visible without animation
            questionContainer.style.opacity = '1';
            questionContainer.style.transform = 'translateY(0)';
        }
    }
    
    // Initialize flip card - use delay to ensure DOM is ready
    setTimeout(() => {
        initFlipCard(correctAnswer);
    }, 200);
}

function initFlipCard(correctAnswer) {
    if (!flipContainer) return;
    
    const card = flipContainer.querySelector('.flip-card');
    if (!card) return;
    
    // Remove old event listeners by cloning
    const newCard = card.cloneNode(true);
    card.parentNode.replaceChild(newCard, card);
    
    const newCardElement = flipContainer.querySelector('.flip-card');
    
    // Update answer text after cloning - get fresh reference
    const newAnswerText = document.getElementById('answerText');
    if (newAnswerText && correctAnswer) {
        newAnswerText.textContent = correctAnswer;
    }
    
    // Add tap/click event listener to flip the card
    newCardElement.addEventListener('click', flipCardToReveal);
    newCardElement.addEventListener('touchend', (e) => {
        e.preventDefault();
        flipCardToReveal();
    });
}

function flipCardToReveal() {
    if (isRevealed) return;
    
    isRevealed = true;
    
    // Flip the card
    const card = flipContainer.querySelector('.flip-card');
    if (card) {
        card.classList.add('flipped');
    }
    
    // Show next button after flip animation
    setTimeout(() => {
        nextButton.classList.remove('hidden');
    }, 400);
}

function handleNext() {
    if (nextButton.classList.contains('hidden')) return;
    
    // Animate out current question
    if (questionContainer) {
        questionContainer.classList.add('fade-out');
        questionContainer.classList.remove('fade-in');
    }
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex < selectedQuestions.length) {
        // More questions to go
        setTimeout(() => {
            renderQuestion();
        }, 300);
    } else {
        // All questions completed
        setTimeout(() => {
            handleQuizCompletion();
        }, 300);
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
            // Small delay to ensure DOM is ready before rendering first question
            setTimeout(() => {
                renderQuestion();
            }, 100);
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

nextButton.addEventListener('click', handleNext);

// Check on page load if already completed today
window.addEventListener('load', () => {
    if (hasCompletedToday()) {
        showLock();
        } else {
        showLanding();
    }
});
