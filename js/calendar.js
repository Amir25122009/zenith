const Calendar = (function() {
    let currentDate = new Date();

    function init() {
        const prevBtn = document.getElementById('calendar-prev');
        const nextBtn = document.getElementById('calendar-next');

        if (prevBtn) prevBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            render();
        });

        if (nextBtn) nextBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            render();
        });
    }

    function render() {
        const monthYearEl = document.getElementById('calendar-month-year');
        const gridEl = document.getElementById('calendar-grid');
        if (!monthYearEl || !gridEl) return;

        monthYearEl.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        gridEl.innerHTML = '';
        
        // Days of week header
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            const d = document.createElement('div');
            d.className = 'calendar-day-header';
            d.textContent = day;
            gridEl.appendChild(d);
        });

        // Blank days before
        for (let i = 0; i < firstDay; i++) {
            const d = document.createElement('div');
            d.className = 'calendar-cell blank';
            gridEl.appendChild(d);
        }

        // Fetch events
        const tasks = typeof Tasks !== 'undefined' ? Tasks.getAll() : [];
        const satScores = typeof SAT !== 'undefined' ? SAT.getAll() : [];
        const studySessions = typeof Study !== 'undefined' ? Study.getAll() : [];
        const goals = typeof Goals !== 'undefined' ? Goals.getAll() : [];

        for (let i = 1; i <= daysInMonth; i++) {
            const d = document.createElement('div');
            d.className = 'calendar-cell';
            d.textContent = i;
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            // Check for events
            const dayEvents = [];
            tasks.forEach(t => { if (t.dueDate === dateStr) dayEvents.push({type: 'task', title: t.title}); });
            satScores.forEach(s => { if (s.date === dateStr) dayEvents.push({type: 'sat', title: 'SAT Test/Score'}); });
            studySessions.forEach(s => { if (s.date === dateStr) dayEvents.push({type: 'study', title: s.subject}); });
            goals.forEach(g => { if (g.deadline === dateStr) dayEvents.push({type: 'goal', title: g.title}); });

            if (dayEvents.length > 0) {
                const dots = document.createElement('div');
                dots.className = 'calendar-dots';
                dayEvents.slice(0, 3).forEach(ev => {
                    const dot = document.createElement('div');
                    dot.className = `calendar-dot dot-${ev.type}`;
                    dots.appendChild(dot);
                });
                d.appendChild(dots);
            }

            if (year === new Date().getFullYear() && month === new Date().getMonth() && i === new Date().getDate()) {
                d.classList.add('today');
            }

            d.addEventListener('click', () => {
                document.querySelectorAll('.calendar-cell').forEach(c => c.classList.remove('selected'));
                d.classList.add('selected');
                showDayEvents(dateStr, dayEvents);
            });

            gridEl.appendChild(d);
        }
    }

    function showDayEvents(dateStr, events) {
        const selDateEl = document.getElementById('calendar-selected-date');
        const dayEventsEl = document.getElementById('calendar-day-events');
        
        if (selDateEl) selDateEl.textContent = new Date(dateStr).toLocaleDateString();
        
        if (dayEventsEl) {
            if (events.length === 0) {
                dayEventsEl.innerHTML = '<p>No events for this date.</p>';
            } else {
                dayEventsEl.innerHTML = events.map(e => `
                    <div class="calendar-event-item event-${e.type}">
                        <strong>${e.type.toUpperCase()}:</strong> ${e.title}
                    </div>
                `).join('');
            }
        }
    }

    return { init, render };
})();
