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

        adjustNotePositions();
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

/**
 * Adjusts the vertical position of note heads based on staff lines.
 */
function adjustNotePositions() {
    const noteCards = document.querySelectorAll('.note-card');
    if (noteCards.length === 0) return;

    noteCards.forEach(card => {
        const staffLinesEl = card.querySelector('.staff-lines');
        const noteHeadEl = card.querySelector('.note-head');
        const ledgerLineEl = card.querySelector('.ledger-line'); // Might be null if not note C
        
        if (!staffLinesEl || !noteHeadEl) return;

        const physicalLines = Array.from(staffLinesEl.querySelectorAll('.line'));
        if (physicalLines.length < 3) return; // Need at least 3 lines for E, G, H

        // Ensure elements are rendered and have dimensions
        if (physicalLines[0].offsetHeight === 0) {
            // Elements might not be fully rendered yet, try again shortly
            // This can happen if called too early or display is none
            // For simplicity, we assume they are visible. If issues persist, 
            // a more robust check or a small delay might be needed.
        }

        const yLineE_center = physicalLines[0].offsetTop + physicalLines[0].offsetHeight / 2;
        const yLineG_center = physicalLines[1].offsetTop + physicalLines[1].offsetHeight / 2;
        const yLineH_center = physicalLines[2].offsetTop + physicalLines[2].offsetHeight / 2;

        // The step is the distance between the centers of two adjacent lines (e.g., E and G)
        // This corresponds to two "note intervals" (e.g., line to line).
        // A single "note interval" (e.g., line to space) is half of this.
        const stepBetweenLines = yLineG_center - yLineE_center; // e.g., from E up to G
        const singleNoteInterval = stepBetweenLines / 2; // e.g., from E up to F

        const noteName = card.dataset.pair;
        let targetYcenterInStaffLines;

        switch (noteName) {
            case 'C':
                targetYcenterInStaffLines = yLineE_center - stepBetweenLines;
                if (ledgerLineEl) {
                    ledgerLineEl.style.top = (targetYcenterInStaffLines - ledgerLineEl.offsetHeight / 2) + 'px';
                    ledgerLineEl.style.left = '50%';
                    ledgerLineEl.style.transform = 'translateX(-50%)';
                }
                break;
            case 'D':
                targetYcenterInStaffLines = yLineE_center - singleNoteInterval;
                break;
            case 'E':
                targetYcenterInStaffLines = yLineE_center;
                break;
            case 'F':
                targetYcenterInStaffLines = yLineE_center + singleNoteInterval;
                break;
            case 'G':
                targetYcenterInStaffLines = yLineG_center;
                break;
            case 'A':
                targetYcenterInStaffLines = yLineG_center + singleNoteInterval;
                break;
            case 'H':
                targetYcenterInStaffLines = yLineH_center;
                break;
            default:
                return; // Unknown note
        }

        // noteHeadEl is a child of staff-container, sibling of staff-lines
        // So, its top is relative to staff-container.
        // targetYcenterInStaffLines is relative to staff-lines top.
        // So, we add staffLinesEl.offsetTop.
        const noteHeadTop = staffLinesEl.offsetTop + targetYcenterInStaffLines - noteHeadEl.offsetHeight / 2;
        noteHeadEl.style.top = noteHeadTop + 'px';
        noteHeadEl.style.bottom = 'auto'; // Override any lingering bottom styles
    });
}

// Adjust positions on initial load (after setupGame) and on resize
document.addEventListener('DOMContentLoaded', () => {
    // adjustNotePositions(); // Already called by setupGame which is in the other DOMContentLoaded
    // Call it again here just to be sure if setupGame structure changes or if elements are added later
    // However, to avoid multiple calls if setupGame also calls it, it's better to ensure one definite call path.
    // The setupGame() in the original DOMContentLoaded will call adjustNotePositions.
});

window.addEventListener('resize', () => {
    // Debounce this in a real app for performance
    adjustNotePositions();
}); 