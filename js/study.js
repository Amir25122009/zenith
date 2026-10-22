const Study = (function() {
    let chartInstance = null;

    function init() {
        const btnAdd = document.getElementById('btn-add-study');
        if (btnAdd) btnAdd.addEventListener('click', () => {
            document.getElementById('study-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('study-subject').value = '';
            document.getElementById('study-topic').value = '';
            document.getElementById('study-hours').value = '0';
            document.getElementById('study-minutes').value = '30';
            document.getElementById('study-result').value = 'productive';
            document.getElementById('study-notes-input').value = '';
            App.openModal('modal-study');
        });

        const btnSave = document.getElementById('study-save');
        if (btnSave) btnSave.addEventListener('click', save);

        const log = document.getElementById('study-log');
        if (log) {
            log.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('.study-delete');
                if (deleteBtn) {
                    Notify.confirm('Delete this study session?').then(confirmed => {
                        if (!confirmed) return;
                        let sessions = Store.get('study_sessions') || [];
                        sessions = sessions.filter(s => s.id !== deleteBtn.dataset.id);
                        Store.set('study_sessions', sessions);
                        render();
                    });
                }
            });
        }
    }

    function save() {
        const date = document.getElementById('study-date').value;
        const subject = document.getElementById('study-subject').value.trim();
        const topic = document.getElementById('study-topic').value.trim();
        const hours = parseInt(document.getElementById('study-hours').value) || 0;
        const minutes = parseInt(document.getElementById('study-minutes').value) || 0;
        const result = document.getElementById('study-result').value;
        const notes = document.getElementById('study-notes-input').value.trim();

        if (!date || !subject || (hours === 0 && minutes === 0)) {
            alert('Please fill out date, subject, and duration.');
            return;
        }

        const session = {
            id: Store.genId('study'),
            date,
            subject,
            topic,
            hours,
            minutes,
            totalMinutes: (hours * 60) + minutes,
            result,
            notes,
            createdAt: new Date().toISOString()
        };

        const sessions = Store.get('study_sessions') || [];
        sessions.push(session);
        Store.set('study_sessions', sessions);
        
        App.closeModal('modal-study');

        // Add XP based on duration (1 XP per minute roughly, max 100 per session maybe? Just keeping it simple: 10xp per 30 mins)
        const xpEarned = Math.floor(session.totalMinutes / 30) * 10 || 5;
        Store.addXP(xpEarned);
        Store.updateStreak('study');
        if (typeof Achievements !== 'undefined') Achievements.updateXPDisplay();

        Toast.show(`Study session saved! +${xpEarned} XP`);
        render();
    }

    function render() {
        const sessions = getAll();
        
        const weekTotalEl = document.getElementById('study-week-total');
        if (weekTotalEl) {
            const wt = getWeekTotal();
            weekTotalEl.textContent = `${wt.hours}h ${wt.minutes}m`;
        }
        
        const streakEl = document.getElementById('study-streak-count');
        if (streakEl) {
            const streaks = Store.getStreaks ? Store.getStreaks() : null;
            streakEl.textContent = streaks ? (streaks.study?.current || 0) : 0;
        }

        const log = document.getElementById('study-log');
        if (log) {
            log.innerHTML = sessions.map(s => `
                <div class="study-item ${s.result}">
                    <div><strong>${s.subject}</strong> - ${s.topic}</div>
                    <div>${s.hours}h ${s.minutes}m on ${new Date(s.date).toLocaleDateString()}</div>
                    <button class="study-delete" data-id="${s.id}">Delete</button>
                </div>
            `).join('');
        }

        const ctx = document.getElementById('study-chart');
        if (ctx && typeof Chart !== 'undefined') {
            if (chartInstance) chartInstance.destroy();
            const weeklyData = getWeeklyData();
            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Study Hours',
                        data: weeklyData,
                        backgroundColor: '#9b59b6'
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    }

    function getAll() {
        const sessions = Store.get('study_sessions') || [];
        return sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function getWeekTotal() {
        const sessions = getAll();
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))); // Monday
        startOfWeek.setHours(0,0,0,0);
        
        let totalMins = 0;
        sessions.forEach(s => {
            const d = new Date(s.date);
            if (d >= startOfWeek) {
                totalMins += s.totalMinutes;
            }
        });

        return {
            hours: Math.floor(totalMins / 60),
            minutes: totalMins % 60
        };
    }

    function getWeeklyData() {
        const sessions = getAll();
        const data = [0, 0, 0, 0, 0, 0, 0]; // Mon - Sun
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));
        startOfWeek.setHours(0,0,0,0);

        sessions.forEach(s => {
            const d = new Date(s.date);
            if (d >= startOfWeek) {
                let day = d.getDay();
                let index = day === 0 ? 6 : day - 1;
                data[index] += s.totalMinutes / 60;
            }
        });
        return data;
    }

    function getTotalHours() {
        const sessions = getAll();
        const mins = sessions.reduce((sum, s) => sum + s.totalMinutes, 0);
        return mins / 60;
    }

    return { init, save, render, getWeekTotal, getWeeklyData, getAll, getTotalHours };
})();
