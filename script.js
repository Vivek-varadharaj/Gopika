// Firebase Configuration is loaded from firebase-config.js
// Make sure firebase-config.js is loaded before this script in index.html

// Initialize Firebase (only if config is provided)
let db = null;

function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.log('Firebase SDK not loaded');
        return;
    }
    
    if (FIREBASE_CONFIG.apiKey === 'YOUR_API_KEY') {
        console.log('Firebase not configured. Logging will be skipped.');
        return;
    }
    
    try {
        firebase.initializeApp(FIREBASE_CONFIG);
        db = firebase.firestore();
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.warn('Firebase initialization failed:', error);
    }
}

// Initialize Firebase when page loads (Firebase SDK loads before this script)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebase);
} else {
    // DOM already loaded
    setTimeout(initializeFirebase, 100); // Small delay to ensure Firebase SDK is loaded
}

// State management
let currentQuestions = [];
let currentQuestionIndex = 0;
let selectedQuestions = [];

// DOM elements
const landingScreen = document.getElementById('landingScreen');
const loadingScreen = document.getElementById('loadingScreen');
const noContentScreen = document.getElementById('noContentScreen');
const contentScreen = document.getElementById('contentScreen');
const completionScreen = document.getElementById('completionScreen');
const lockScreen = document.getElementById('lockScreen');
const prizeScreen = document.getElementById('prizeScreen');

const startButton = document.getElementById('startButton');
const backToLandingButton1 = document.getElementById('backToLandingButton1');
const backToLandingButton2 = document.getElementById('backToLandingButton2');
const backToLandingButton3 = document.getElementById('backToLandingButton3');
const backToLandingButton4 = document.getElementById('backToLandingButton4');
const progressText = document.getElementById('progressText');
const questionText = document.getElementById('questionText');
const answerText = document.getElementById('answerText');
const answerContainer = document.getElementById('answerContainer');
const answerOverlay = document.getElementById('answerOverlay');
const nextButton = document.getElementById('nextButton');

const questionContainer = document.querySelector('.question-container');

// Utility functions
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// Screen management
function hideAllScreens() {
    landingScreen.classList.add('hidden');
    loadingScreen.classList.add('hidden');
    noContentScreen.classList.add('hidden');
    contentScreen.classList.add('hidden');
    completionScreen.classList.add('hidden');
    lockScreen.classList.add('hidden');
    prizeScreen.classList.add('hidden');
}

function showLanding() {
    hideAllScreens();
    landingScreen.classList.remove('hidden');
}

function showLoading() {
    hideAllScreens();
    loadingScreen.classList.remove('hidden');
}

function showNoContent() {
    hideAllScreens();
    noContentScreen.classList.remove('hidden');
}

function showContent() {
    hideAllScreens();
    contentScreen.classList.remove('hidden');
}

function showCompletion() {
    hideAllScreens();
    completionScreen.classList.remove('hidden');
}

function showLock() {
    hideAllScreens();
    lockScreen.classList.remove('hidden');
}

function showPrize() {
    hideAllScreens();
    prizeScreen.classList.remove('hidden');
}

// 25-Day Progress Tracking
function getCompletedDays() {
    const stored = localStorage.getItem('completedDays');
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch (e) {
        return [];
    }
}

function addCompletedDay(date) {
    const completedDays = getCompletedDays();
    if (!completedDays.includes(date)) {
        completedDays.push(date);
        localStorage.setItem('completedDays', JSON.stringify(completedDays));
    }
    return completedDays.length;
}

function getCompletedDaysCount() {
    return getCompletedDays().length;
}

function hasCompletedToday() {
    const today = getTodayDate();
    const completedDays = getCompletedDays();
    return completedDays.includes(today);
}

// Firebase Logging
async function logCompletion(date) {
    if (!db) {
        console.log('Firebase not configured. Skipping logging.');
        console.log('To enable logging, configure Firebase and update FIREBASE_CONFIG in script.js');
        return;
    }
    
    try {
        const completionData = {
            date: date,
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'completed',
            timestamp: new Date().toISOString()
        };
        
        // Add document to 'completions' collection
        await db.collection('completions').add(completionData);
        console.log('Completion logged successfully to Firebase');
    } catch (error) {
        // Silent failure - don't block progress, but log for debugging
        console.warn('Firebase logging failed (non-blocking):', error);
        console.warn('This is normal if Firebase is not configured or permissions are not set.');
    }
}

// Firebase - Fetch questions
async function fetchQuestionsFromFirebase() {
    if (!db) {
        throw new Error('Firebase not initialized. Please configure Firebase.');
    }
    
    try {
        const questionsSnapshot = await db.collection('questions').get();
        const questions = [];
        
        questionsSnapshot.forEach(doc => {
            const data = doc.data();
            questions.push({
                id: doc.id,
                date: data.date,
                question: data.question,
                answer: data.answer
            });
        });
        
        return questions;
    } catch (error) {
        console.error('Error fetching questions from Firebase:', error);
        throw error;
    }
}

function filterTodayQuestions(questions) {
    const today = getTodayDate();
    return questions.filter(q => q.date === today);
}

// Content rendering
function renderQuestion() {
    if (!selectedQuestions || selectedQuestions.length === 0 || currentQuestionIndex >= selectedQuestions.length) {
        console.error('No question available at index:', currentQuestionIndex);
        return;
    }
    
    const question = selectedQuestions[currentQuestionIndex];
    if (!question) {
        console.error('Question is undefined at index:', currentQuestionIndex);
        return;
    }
    
    // Update progress
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${selectedQuestions.length}`;
    
    // Update question text
    questionText.textContent = question.question;
    
    // Update answer text
    answerText.textContent = question.answer;
    
    // Reset answer overlay
    answerContainer.classList.remove('revealed');
    nextButton.classList.add('hidden');
    
    // Add fade-in animation (only if not the first question)
    if (questionContainer) {
        questionContainer.classList.remove('fade-out');
        if (currentQuestionIndex > 0) {
            questionContainer.classList.add('fade-in');
            setTimeout(() => {
                questionContainer.classList.remove('fade-in');
            }, 400);
        } else {
            questionContainer.style.opacity = '1';
            questionContainer.style.transform = 'translateY(0)';
        }
    }
}

function revealAnswer() {
    answerContainer.classList.add('revealed');
    nextButton.classList.remove('hidden');
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
            handleContentCompletion();
        }, 300);
    }
}

async function handleContentCompletion() {
    const today = getTodayDate();
    
    // Add to completed days
    const completedCount = addCompletedDay(today);
    
    // Log completion (silent, non-blocking)
    logCompletion(today).catch(() => {});
    
    // Check if 25 days completed
    if (completedCount >= 25) {
        showPrize();
    } else {
        showCompletion();
    }
}

// Event listeners
startButton.addEventListener('click', async () => {
    // Check if 25 days completed - show prize
    if (getCompletedDaysCount() >= 25) {
        showPrize();
        return;
    }
    
    // Check if already completed today
    if (hasCompletedToday()) {
        showLock();
        return;
    }
    
    showLoading();
    
    try {
        // Fetch questions from Firebase
        const allQuestions = await fetchQuestionsFromFirebase();
        
        // Filter questions for today
        const todayQuestions = filterTodayQuestions(allQuestions);
        
        if (todayQuestions.length === 0) {
            showNoContent();
            return;
        }
        
        // Use all questions for today
        selectedQuestions = todayQuestions;
        currentQuestionIndex = 0;
        
        // Render first question
        showContent();
        renderQuestion();
        
    } catch (error) {
        console.error('Error loading content:', error);
        showNoContent();
    }
});

// Answer overlay click handler
answerOverlay.addEventListener('click', revealAnswer);
answerOverlay.addEventListener('touchend', (e) => {
    e.preventDefault();
    revealAnswer();
});

// Next button handler
nextButton.addEventListener('click', handleNext);

// Back button handlers
backToLandingButton1.addEventListener('click', showLanding);
backToLandingButton2.addEventListener('click', showLanding);
backToLandingButton3.addEventListener('click', showLanding);
backToLandingButton4.addEventListener('click', showLanding);

// Initial setup
window.addEventListener('load', () => {
    // Check if 25 days completed
    if (getCompletedDaysCount() >= 25) {
        showPrize();
    } else if (hasCompletedToday()) {
        showLock();
        } else {
        showLanding();
    }
});