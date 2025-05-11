document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const notesColumn = document.getElementById('notesColumn');
    const namesColumn = document.getElementById('namesColumn');
    const scoreDisplay = document.getElementById('score');
    const successPopup = document.getElementById('successPopup');
    const playAgainButton = document.getElementById('playAgainButton');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const currentYearElement = document.getElementById('current-year');
    
    // Set current year in footer
    currentYearElement.textContent = new Date().getFullYear();

    // Game state variables
    let noteCards = Array.from(notesColumn.children);
    let nameCards = Array.from(namesColumn.children);
    let selectedNote = null;
    let selectedName = null;
    let score = 0;
    let matchedPairs = 0;
    const totalPairs = noteCards.length;

    /**
     * Randomize array in-place using the Fisher-Yates shuffle algorithm
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Set up the game: reset score, clear selections, shuffle cards
     */
    function setupGame() {
        // Reset game state
        score = 0;
        matchedPairs = 0;
        selectedNote = null;
        selectedName = null;
        updateScoreDisplay();
        
        // Reset UI state
        feedbackMessage.textContent = '';
        feedbackMessage.className = 'feedback-message';
        successPopup.classList.remove('show');

        // Shuffle and reset cards
        shuffleArray(noteCards);
        shuffleArray(nameCards);

        // Clear and rebuild the card containers
        notesColumn.innerHTML = '';
        namesColumn.innerHTML = '';

        noteCards.forEach(card => {
            card.classList.remove('selected', 'matched');
            card.style.visibility = 'visible'; 
            card.style.opacity = '1';
            notesColumn.appendChild(card);
            addCardEventListener(card);
        });
        
        nameCards.forEach(card => {
            card.classList.remove('selected', 'matched');
            card.style.visibility = 'visible'; 
            card.style.opacity = '1';
            namesColumn.appendChild(card);
            addCardEventListener(card);
        });
    }

    /**
     * Update the score display
     */
    function updateScoreDisplay() {
        scoreDisplay.textContent = score;
    }

    /**
     * Handle card click events
     */
    function handleCardClick(event) {
        const clickedCard = event.currentTarget;

        // Ignore clicks on matched cards or when checking a match
        if (clickedCard.classList.contains('matched') || (selectedNote && selectedName)) {
            return;
        }

        const cardType = clickedCard.dataset.type;

        // If clicking on already selected card, deselect it
        if (clickedCard.classList.contains('selected')) {
            clickedCard.classList.remove('selected');
            if (cardType === 'note') {
                selectedNote = null;
            } else if (cardType === 'name') {
                selectedName = null;
            }
            return; 
        }

        // Select the clicked card
        if (cardType === 'note') {
            if (selectedNote) {
                selectedNote.classList.remove('selected');
            }
            selectedNote = clickedCard;
        } else if (cardType === 'name') {
            if (selectedName) {
                selectedName.classList.remove('selected');
            }
            selectedName = clickedCard;
        }
       
        clickedCard.classList.add('selected');

        // If both a note and name are selected, check for a match
        if (selectedNote && selectedName) {
            checkMatch();
        }
    }
   
    /**
     * Add event listeners to cards for mouse and keyboard interaction
     */
    function addCardEventListener(card) {
        card.addEventListener('click', handleCardClick);
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault(); 
                handleCardClick(event);
            }
        });
    }

    /**
     * Check if selected note and name match
     */
    function checkMatch() {
        if (selectedNote.dataset.pair === selectedName.dataset.pair) {
            // Match found
            score += 10;
            matchedPairs++;
            
            feedbackMessage.textContent = 'Rätt par!';
            feedbackMessage.className = 'feedback-message correct';

            selectedNote.classList.add('matched');
            selectedName.classList.add('matched');
           
            selectedNote.classList.remove('selected'); 
            selectedName.classList.remove('selected');

            const justMatchedNote = selectedNote;
            const justMatchedName = selectedName;

            selectedNote = null; 
            selectedName = null;

            // Check if game is complete
            setTimeout(() => {
                if (matchedPairs === totalPairs) {
                    successPopup.classList.add('show');
                }
            }, 600); 

        } else {
            // No match
            score = Math.max(0, score - 2); // Don't go below zero
            
            feedbackMessage.textContent = 'Fel par, försök igen!';
            feedbackMessage.className = 'feedback-message incorrect';

            const tempSelectedNote = selectedNote;
            const tempSelectedName = selectedName;
           
            selectedNote = null; 
            selectedName = null;
           
            setTimeout(() => {
                if(tempSelectedNote) tempSelectedNote.classList.remove('selected');
                if(tempSelectedName) tempSelectedName.classList.remove('selected');
            }, 800); 
        }
        
        updateScoreDisplay();
    }

    // Event listener for "Play Again" button
    playAgainButton.addEventListener('click', (e) => {
        e.preventDefault();
        setupGame();
    });

    // Start the game
    setupGame();
}); 