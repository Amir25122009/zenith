const Analytics = (function() {
    let charts = {};

    function init() {
        // Init happens usually on demand or page load
    }

    function render() {
        // Update stats cards
        const tasksCompletedEl = document.getElementById('analytics-tasks-completed');
        const studyHoursEl = document.getElementById('analytics-study-hours');
        const satImprovementEl = document.getElementById('analytics-sat-improvement');
        const booksCompletedEl = document.getElementById('analytics-books-completed');
        const goalsCompletedEl = document.getElementById('analytics-goals-completed');
        const currentStreakEl = document.getElementById('analytics-current-streak');

        if (tasksCompletedEl && typeof Tasks !== 'undefined') tasksCompletedEl.textContent = Tasks.getAll().filter(t => t.completed).length;
        if (studyHoursEl && typeof Study !== 'undefined') studyHoursEl.textContent = Study.getTotalHours().toFixed(1) + 'h';
        if (satImprovementEl && typeof SAT !== 'undefined') satImprovementEl.textContent = SAT.getImprovement();
        if (booksCompletedEl && typeof Books !== 'undefined') booksCompletedEl.textContent = Books.getCompletedCount();
        if (goalsCompletedEl && typeof Goals !== 'undefined') goalsCompletedEl.textContent = Goals.getAll().filter(g => g.currentValue >= g.targetValue).length;
        
        if (currentStreakEl) {
            const streaks = Store.getStreaks ? Store.getStreaks() : null;
            currentStreakEl.textContent = streaks && streaks.daily ? streaks.daily.current : 0;
        }

        // Render Charts
        if (typeof Chart === 'undefined') return;

        destroyCharts();

        const ctx1 = document.getElementById('chart-weekly-productivity');
        if (ctx1 && typeof Tasks !== 'undefined') {
            const data = Tasks.getWeeklyCompleted ? Tasks.getWeeklyCompleted() : [0,0,0,0,0,0,0];
            charts['weekly'] = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{ label: 'Tasks Completed', data, backgroundColor: '#3498db' }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        const ctx2 = document.getElementById('chart-study-hours');
        if (ctx2 && typeof Study !== 'undefined') {
            const data = Study.getWeeklyData();
            charts['study'] = new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{ label: 'Study Hours', data, borderColor: '#9b59b6', fill: true, backgroundColor: 'rgba(155, 89, 182, 0.2)' }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        const ctx3 = document.getElementById('chart-sat-progress');
        if (ctx3 && typeof SAT !== 'undefined') {
            const scores = SAT.getAll().reverse();
            charts['sat'] = new Chart(ctx3, {
                type: 'line',
                data: {
                    labels: scores.map(s => new Date(s.date).toLocaleDateString()),
                    datasets: [{ label: 'Total Score', data: scores.map(s => s.total), borderColor: '#e67e22', fill: false }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        const ctx4 = document.getElementById('chart-completed-tasks');
        if (ctx4) {
            // Dummy data for completed tasks distribution
            charts['completed'] = new Chart(ctx4, {
                type: 'doughnut',
                data: {
                    labels: ['Study', 'Personal', 'Fitness'],
                    datasets: [{ data: [10, 5, 2], backgroundColor: ['#3498db', '#2ecc71', '#e74c3c'] }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        const ctx5 = document.getElementById('chart-monthly-progress');
        if (ctx5) {
            charts['monthly'] = new Chart(ctx5, {
                type: 'bar',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{ label: 'XP Earned', data: [500, 700, 600, 800], backgroundColor: '#f1c40f' }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    }

    function destroyCharts() {
        Object.keys(charts).forEach(key => {
            if (charts[key]) charts[key].destroy();
        });
        charts = {};
    }

    return { init, render };
})();
