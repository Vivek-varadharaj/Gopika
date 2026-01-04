const surpriseButton = document.getElementById('surpriseButton');
const message = document.getElementById('message');
const smileRainContainer = document.getElementById('smileRainContainer');
const sparklesContainer = document.getElementById('sparklesContainer');
const imagesGrid = document.getElementById('imagesGrid');
const backgroundMusic = document.getElementById('backgroundMusic');

let animationStarted = false;
const sparkles = ['✨', '⭐', '💫', '🌟'];

// Background images for slideshow
const backgroundImages = [
    'WhatsApp Image 2026-01-05 at 1.07.12 AM.jpeg',
    'WhatsApp Image 2026-01-05 at 1.07.12 AM (1).jpeg',
    'WhatsApp Image 2026-01-05 at 1.07.12 AM (2).jpeg',
    'WhatsApp Image 2026-01-05 at 1.07.12 AM (3).jpeg',
    'WhatsApp Image 2026-01-05 at 1.07.12 AM (4).jpeg',
    'WhatsApp Image 2026-01-05 at 1.07.12 AM (5).jpeg',
    'WhatsApp Image 2026-01-05 at 1.07.12 AM (6).jpeg',
    'WhatsApp Image 2026-01-05 at 1.07.12 AM (7).jpeg',
    'WhatsApp Image 2026-01-05 at 1.07.12 AM (8).jpeg'
];

let currentImageIndex = 0;
let slideshowInterval = null;

// Initialize background image
function initializeBackgroundImage() {
    // Create two image layers for crossfading
    const img1 = document.createElement('img');
    img1.src = backgroundImages[0];
    img1.alt = 'Background';
    img1.className = 'background-image background-image-1';
    img1.loading = 'eager';
    imagesGrid.appendChild(img1);
    
    const img2 = document.createElement('img');
    img2.src = backgroundImages[0];
    img2.alt = 'Background';
    img2.className = 'background-image background-image-2';
    img2.style.opacity = '0';
    imagesGrid.appendChild(img2);
    
    // Preload all images for smooth transitions
    backgroundImages.forEach((src) => {
        const preloadImg = new Image();
        preloadImg.src = src;
    });
}

// Start slideshow
function startSlideshow() {
    const img1 = imagesGrid.querySelector('.background-image-1');
    const img2 = imagesGrid.querySelector('.background-image-2');
    
    if (!img1 || !img2) {
        console.log('Background images not found');
        return;
    }
    
    let currentImg = img1;
    let nextImg = img2;
    
    // Wait for initial fade-in animation to complete, then start slideshow
    setTimeout(() => {
        img1.classList.add('slideshow-active');
        img2.classList.add('slideshow-active');
        
        // Preload second image before first transition
        currentImageIndex = 0;
        const secondImageSrc = backgroundImages[1];
        const preloadImg = new Image();
        preloadImg.onload = () => {
            // Second image is ready, now start the slideshow
            nextImg.src = secondImageSrc;
            
            // Start slideshow after ensuring second image is loaded
            setTimeout(() => {
                // Change image every 3 seconds using crossfade
                slideshowInterval = setInterval(() => {
                    currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
                    const nextImageSrc = backgroundImages[currentImageIndex];
                    
                    // Preload the next image before crossfading
                    const preloadNext = new Image();
                    preloadNext.onload = () => {
                        // Set the next image source on the hidden layer
                        nextImg.src = nextImageSrc;
                        
                        // Small delay to ensure image is rendered
                        requestAnimationFrame(() => {
                            // Fade out current image, fade in next image
                            currentImg.style.opacity = '0';
                            nextImg.style.opacity = '1';
                            
                            // Swap references for next transition
                            const temp = currentImg;
                            currentImg = nextImg;
                            nextImg = temp;
                        });
                    };
                    preloadNext.src = nextImageSrc;
                }, 3000);
                
                // Trigger first transition after a short delay
                setTimeout(() => {
                    currentImageIndex = 1;
                    requestAnimationFrame(() => {
                        currentImg.style.opacity = '0';
                        nextImg.style.opacity = '1';
                        
                        const temp = currentImg;
                        currentImg = nextImg;
                        nextImg = temp;
                    });
                }, 3000);
            }, 100);
        };
        preloadImg.src = secondImageSrc;
    }, 1500); // Wait for initial animation to complete
}

// Initialize background on page load
initializeBackgroundImage();

surpriseButton.addEventListener('click', function() {
    if (animationStarted) return;
    
    animationStarted = true;
    
    // Start background music
    if (backgroundMusic) {
        backgroundMusic.volume = 0.5; // Set volume to 50%
        backgroundMusic.play().catch(error => {
            console.log('Audio play failed:', error);
            // Audio autoplay may be blocked by browser, user interaction is needed
        });
    }
    
    // Show background image
    imagesGrid.classList.add('active');
    
    // Start slideshow
    startSlideshow();
    
    // Create sparkles on button click
    createButtonSparkles();
    
    // Hide the button with animation
    surpriseButton.style.transform = 'scale(0)';
    surpriseButton.style.opacity = '0';
    setTimeout(() => {
        surpriseButton.style.display = 'none';
    }, 300);
    
    // Start smile rain animation and reveal text
    setTimeout(() => {
        startSmileRain();
    }, 500);
});

function createButtonSparkles() {
    // Create sparkles around the button
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
            
            const angle = (i / 12) * Math.PI * 2;
            const distance = 80;
            const startX = surpriseButton.offsetLeft + surpriseButton.offsetWidth / 2;
            const startY = surpriseButton.offsetTop + surpriseButton.offsetHeight / 2;
            
            sparkle.style.left = startX + 'px';
            sparkle.style.top = startY + 'px';
            sparkle.style.animationDelay = (i * 0.05) + 's';
            
            sparklesContainer.appendChild(sparkle);
            
            // Remove sparkle after animation
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 3000);
        }, i * 50);
    }
}

function startSmileRain() {
    // Array of smile variations (text and emoji)
    const smileVariations = ['Smile', '😊', '😄', '😃', '☺️', '🙂', '😁'];
    
    // Create "Smile" text and emoji falling like rain
    const createSmileRain = () => {
        const smileElement = document.createElement('div');
        smileElement.className = 'smile-rain';
        
        // Randomly choose between text or emoji
        const randomVariation = smileVariations[Math.floor(Math.random() * smileVariations.length)];
        smileElement.textContent = randomVariation;
        
        // Random horizontal position
        const leftPosition = Math.random() * 100;
        smileElement.style.left = leftPosition + '%';
        
        // Random animation duration (3-6 seconds for varied speeds)
        const duration = 3 + Math.random() * 3;
        smileElement.style.animationDuration = duration + 's';
        
        // Random delay (0-2 seconds for staggered effect)
        const delay = Math.random() * 2;
        smileElement.style.animationDelay = delay + 's';
        
        // Random font size for variety (smaller for emojis)
        const isEmoji = randomVariation.length === 1 || randomVariation.length === 2;
        const fontSize = isEmoji ? (30 + Math.random() * 20) : (24 + Math.random() * 16);
        smileElement.style.fontSize = fontSize + 'px';
        
        // Random opacity
        const opacity = 0.6 + Math.random() * 0.4;
        smileElement.style.opacity = opacity;
        
        smileRainContainer.appendChild(smileElement);
        
        // Remove smile element after animation completes
        setTimeout(() => {
            if (smileElement.parentNode) {
                smileElement.parentNode.removeChild(smileElement);
            }
        }, (duration + delay) * 1000);
    };
    
    // Create initial burst of "Smile" rain
    for (let i = 0; i < 40; i++) {
        setTimeout(() => createSmileRain(), i * 100);
    }
    
    // Continue creating smile rain for 8 seconds
    const smileInterval = setInterval(() => {
        createSmileRain();
    }, 150);
    
    // Stop creating new smiles after 8 seconds, but let existing ones finish
    setTimeout(() => {
        clearInterval(smileInterval);
    }, 8000);
    
    // Reveal text progressively as smile rain falls
    const textRevealDelay = 2000; // Start revealing text after 2 seconds
    
    setTimeout(() => {
        message.innerHTML = `
            <h1 class="text-reveal">Arike thanna munthiri..<br>Punjiriku yen sundhari...</h1>
        `;
        message.classList.add('updated');
    }, textRevealDelay);
}

