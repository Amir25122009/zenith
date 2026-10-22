const AI = (function() {
    function init() {
        const sendBtn = document.getElementById('ai-send');
        const inputField = document.getElementById('ai-input');

        if (sendBtn) sendBtn.addEventListener('click', () => {
            const text = inputField.value.trim();
            if (text) {
                sendMessage(text);
                inputField.value = '';
            }
        });

        if (inputField) inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const text = inputField.value.trim();
                if (text) {
                    sendMessage(text);
                    inputField.value = '';
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ai-suggestion')) {
                sendMessage(e.target.textContent);
            }
        });
    }

    function sendMessage(text) {
        const messages = document.getElementById('ai-messages');
        if (!messages) return;

        // User message
        const userMsg = document.createElement('div');
        userMsg.className = 'ai-msg user';
        userMsg.textContent = text;
        messages.appendChild(userMsg);
        messages.scrollTop = messages.scrollHeight;

        // Thinking
        const thinkMsg = document.createElement('div');
        thinkMsg.className = 'ai-msg ai thinking';
        thinkMsg.textContent = 'Thinking...';
        messages.appendChild(thinkMsg);
        messages.scrollTop = messages.scrollHeight;

        // Simulate AI response
        setTimeout(() => {
            messages.removeChild(thinkMsg);
            const aiMsg = document.createElement('div');
            aiMsg.className = 'ai-msg ai';
            aiMsg.innerHTML = generateResponse(text);
            messages.appendChild(aiMsg);
            messages.scrollTop = messages.scrollHeight;
        }, 1500);
    }

    function generateResponse(text) {
        const q = text.toLowerCase();
        if (q.includes('sat')) {
            const score = typeof SAT !== 'undefined' ? SAT.getLatest() : null;
            if (score) return `Your latest SAT score is ${score.total}. Try focusing on ${score.math < score.rw ? 'Math' : 'Reading & Writing'}.`;
            return "You haven't logged any SAT scores yet. Keep studying!";
        }
        if (q.includes('study')) {
            return "Based on your habits, you study best in the evening. Try planning 2 hours of focused study tonight.";
        }
        if (q.includes('book')) {
            return "You should finish the book you're currently reading before starting a new one. Reading daily improves comprehension!";
        }
        return "I'm here to help you achieve your Zenith! Ask me about your study habits, SAT prep, or goals.";
    }

    function getRecommendations() {
        let html = '';
        
        // Simple mock recommendations
        html += `<div class="ai-recommendation-card">
            <h4>Optimize Study Time</h4>
            <p>You haven't logged much study time this week. Try the Pomodoro technique to get started.</p>
        </div>`;

        html += `<div class="ai-recommendation-card">
            <h4>SAT Math Focus</h4>
            <p>Your Math score is lagging behind R&W. Dedicate 30 mins a day to practice problems.</p>
        </div>`;

        return html;
    }

    return { init, sendMessage, getRecommendations };
})();
