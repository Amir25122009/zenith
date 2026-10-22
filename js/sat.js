const SAT = (function() {
    let chartInstance = null;

    function init() {
        const btnAddSat = document.getElementById('btn-add-sat');
        if (btnAddSat) {
            btnAddSat.addEventListener('click', () => {
                document.getElementById('sat-date').value = new Date().toISOString().split('T')[0];
                document.getElementById('sat-math').value = '';
                document.getElementById('sat-rw').value = '';
                document.getElementById('sat-total').value = '';
                App.openModal('modal-sat');
            });
        }

        const btnSave = document.getElementById('sat-save');
        if (btnSave) {
            btnSave.addEventListener('click', save);
        }

        const mathInput = document.getElementById('sat-math');
        const rwInput = document.getElementById('sat-rw');
        const totalInput = document.getElementById('sat-total');

        const calcTotal = () => {
            const math = parseInt(mathInput.value) || 0;
            const rw = parseInt(rwInput.value) || 0;
            totalInput.value = (math || rw) ? (math + rw) : '';
        };

        if (mathInput) mathInput.addEventListener('input', calcTotal);
        if (rwInput) rwInput.addEventListener('input', calcTotal);

        const list = document.getElementById('sat-scores-list');
        if (list) {
            list.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('.sat-delete');
                if (deleteBtn) {
                    const id = deleteBtn.dataset.id;
                    Notify.confirm('Are you sure you want to delete this score?').then(confirmed => {
                        if (!confirmed) return;
                        let scores = Store.get('sat_scores') || [];
                        scores = scores.filter(s => s.id !== id);
                        Store.set('sat_scores', scores);
                        render();
                    });
                }
            });
        }
    }

    function save() {
        const date = document.getElementById('sat-date').value;
        const math = parseInt(document.getElementById('sat-math').value) || 0;
        const rw = parseInt(document.getElementById('sat-rw').value) || 0;

        if (!date || math < 200 || math > 800 || rw < 200 || rw > 800) {
            alert('Please enter valid date and scores (200-800).');
            return;
        }

        const score = {
            id: Store.genId('sat'),
            date,
            math,
            rw,
            total: math + rw,
            createdAt: new Date().toISOString()
        };

        const scores = Store.get('sat_scores') || [];
        scores.push(score);
        Store.set('sat_scores', scores);

        App.closeModal('modal-sat');
        Toast.show('SAT score saved!');
        
        Store.addXP(30);
        if (typeof Achievements !== 'undefined') Achievements.updateXPDisplay();
        
        render();
    }

    function render() {
        const scores = getAll();
        
        // Update Stats
        const bestScoreEl = document.getElementById('sat-best-score');
        const avgScoreEl = document.getElementById('sat-avg-score');
        const latestScoreEl = document.getElementById('sat-latest-score');
        const improvementEl = document.getElementById('sat-improvement');
        const mathImprovementEl = document.getElementById('sat-math-improvement');
        const rwImprovementEl = document.getElementById('sat-rw-improvement');

        if (scores.length > 0) {
            const best = Math.max(...scores.map(s => s.total));
            const avg = Math.round(scores.reduce((sum, s) => sum + s.total, 0) / scores.length);
            const latest = getLatest().total;
            
            const first = scores[scores.length - 1]; // Oldest is at end since sorted by date desc
            const latestScore = scores[0]; // Newest
            
            const improvement = latestScore.total - first.total;
            const mathImprovement = latestScore.math - first.math;
            const rwImprovement = latestScore.rw - first.rw;

            if (bestScoreEl) bestScoreEl.textContent = best;
            if (avgScoreEl) avgScoreEl.textContent = avg;
            if (latestScoreEl) latestScoreEl.textContent = latest;
            if (improvementEl) improvementEl.textContent = improvement > 0 ? `+${improvement}` : improvement;
            if (mathImprovementEl) mathImprovementEl.textContent = mathImprovement > 0 ? `+${mathImprovement}` : mathImprovement;
            if (rwImprovementEl) rwImprovementEl.textContent = rwImprovement > 0 ? `+${rwImprovement}` : rwImprovement;
        } else {
            if (bestScoreEl) bestScoreEl.textContent = '--';
            if (avgScoreEl) avgScoreEl.textContent = '--';
            if (latestScoreEl) latestScoreEl.textContent = '--';
            if (improvementEl) improvementEl.textContent = '--';
            if (mathImprovementEl) mathImprovementEl.textContent = '--';
            if (rwImprovementEl) rwImprovementEl.textContent = '--';
        }

        // Render List
        const list = document.getElementById('sat-scores-list');
        if (list) {
            list.innerHTML = scores.map(s => `
                <div class="score-item">
                    <div class="score-date">${new Date(s.date).toLocaleDateString()}</div>
                    <div class="score-total">Total: <strong>${s.total}</strong></div>
                    <div class="score-math">Math: ${s.math}</div>
                    <div class="score-rw">R&W: ${s.rw}</div>
                    <button class="sat-delete" data-id="${s.id}">Delete</button>
                </div>
            `).join('');
        }

        // Render Chart
        const ctx = document.getElementById('sat-chart');
        if (ctx && typeof Chart !== 'undefined') {
            if (chartInstance) chartInstance.destroy();
            
            const chartData = [...scores].reverse(); // oldest to newest for chart
            
            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartData.map(s => new Date(s.date).toLocaleDateString()),
                    datasets: [
                        { label: 'Total', data: chartData.map(s => s.total), borderColor: '#4a90e2', fill: false },
                        { label: 'Math', data: chartData.map(s => s.math), borderColor: '#e24a4a', fill: false },
                        { label: 'R&W', data: chartData.map(s => s.rw), borderColor: '#4ae24a', fill: false }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    }

    function getLatest() {
        const scores = getAll();
        return scores.length > 0 ? scores[0] : null;
    }

    function getImprovement() {
        const scores = getAll();
        if (scores.length < 2) return 0;
        const first = scores[scores.length - 1].total;
        const latest = scores[0].total;
        return latest - first;
    }

    function getAll() {
        const scores = Store.get('sat_scores') || [];
        return scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return { init, save, render, getLatest, getImprovement, getAll };
})();
