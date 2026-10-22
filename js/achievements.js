const Achievements = (function() {
    function init() {
        // init usually bound to page load
    }

    function checkAchievements() {
        let unlocked = Store.get('unlocked_achievements') || [];
        const newUnlocks = [];
        
        const streaks = Store.getStreaks ? Store.getStreaks() : null;
        
        // Helper to unlock
        const unlock = (id) => {
            if (!unlocked.includes(id)) {
                unlocked.push(id);
                newUnlocks.push(id);
                Toast.show('🏆 Achievement Unlocked!');
            }
        };

        // Tasks
        if (typeof Tasks !== 'undefined') {
            const completedTasks = Tasks.getAll().filter(t => t.completed).length;
            if (completedTasks >= 1) unlock('task_1');
            if (completedTasks >= 10) unlock('task_10');
            if (completedTasks >= 50) unlock('task_50');
        }

        // Goals
        if (typeof Goals !== 'undefined') {
            const completedGoals = Goals.getAll().filter(g => g.currentValue >= g.targetValue).length;
            if (completedGoals >= 1) unlock('goal_1');
            if (completedGoals >= 5) unlock('goal_5');
        }

        // Books
        if (typeof Books !== 'undefined') {
            const completedBooks = Books.getCompletedCount();
            if (completedBooks >= 1) unlock('book_1');
            if (completedBooks >= 5) unlock('book_5');
        }

        // SAT
        if (typeof SAT !== 'undefined') {
            if (SAT.getAll().length >= 1) unlock('sat_1');
            if (SAT.getImprovement() > 0) unlock('sat_improve');
        }

        // Study
        if (typeof Study !== 'undefined') {
            const totalHours = Study.getTotalHours();
            if (totalHours >= 10) unlock('study_10h');
            if (totalHours >= 50) unlock('study_50h');
        }

        // Streaks
        if (streaks) {
            if (streaks.daily && streaks.daily.current >= 3) unlock('streak_3');
            if (streaks.daily && streaks.daily.current >= 7) unlock('streak_7');
            if (streaks.daily && streaks.daily.current >= 30) unlock('streak_30');
        }

        if (newUnlocks.length > 0) {
            Store.set('unlocked_achievements', unlocked);
            render();
        }
    }

    function render() {
        updateXPDisplay();
        
        // Render Streaks
        const streaks = Store.getStreaks ? Store.getStreaks() : null;
        if (streaks) {
            const sDaily = document.getElementById('streak-daily');
            const sDailyBest = document.getElementById('streak-daily-best');
            const sReading = document.getElementById('streak-reading');
            const sReadingBest = document.getElementById('streak-reading-best');
            const sStudy = document.getElementById('streak-study');
            const sStudyBest = document.getElementById('streak-study-best');
            const sGoal = document.getElementById('streak-goal');
            const sGoalBest = document.getElementById('streak-goal-best');

            if (sDaily) sDaily.textContent = streaks.daily?.current || 0;
            if (sDailyBest) sDailyBest.textContent = streaks.daily?.best || 0;
            
            if (sReading) sReading.textContent = streaks.reading?.current || 0;
            if (sReadingBest) sReadingBest.textContent = streaks.reading?.best || 0;
            
            if (sStudy) sStudy.textContent = streaks.study?.current || 0;
            if (sStudyBest) sStudyBest.textContent = streaks.study?.best || 0;
            
            if (sGoal) sGoal.textContent = streaks.goal?.current || 0;
            if (sGoalBest) sGoalBest.textContent = streaks.goal?.best || 0;
        }

        // Render Grid
        const grid = document.getElementById('achievements-grid');
        if (grid) {
            const unlocked = Store.get('unlocked_achievements') || [];
            
            const achList = [
                { id: 'task_1', title: 'First Step', desc: 'Complete 1 task' },
                { id: 'task_10', title: 'Getting Done', desc: 'Complete 10 tasks' },
                { id: 'task_50', title: 'Task Master', desc: 'Complete 50 tasks' },
                { id: 'goal_1', title: 'Goal Setter', desc: 'Complete 1 goal' },
                { id: 'goal_5', title: 'Go Getter', desc: 'Complete 5 goals' },
                { id: 'book_1', title: 'Bookworm', desc: 'Read 1 book' },
                { id: 'book_5', title: 'Avid Reader', desc: 'Read 5 books' },
                { id: 'sat_1', title: 'Baseline', desc: 'Log first SAT score' },
                { id: 'sat_improve', title: 'Moving Up', desc: 'Improve SAT score' },
                { id: 'study_10h', title: 'Focused', desc: 'Study for 10 hours' },
                { id: 'study_50h', title: 'Scholar', desc: 'Study for 50 hours' },
                { id: 'streak_3', title: 'On a Roll', desc: '3 day streak' },
                { id: 'streak_7', title: 'Consistent', desc: '7 day streak' },
                { id: 'streak_30', title: 'Unstoppable', desc: '30 day streak' }
                // total 18 can be added here
            ];

            grid.innerHTML = achList.map(a => {
                const isUnlocked = unlocked.includes(a.id);
                return `
                    <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                        <div class="ach-icon">${isUnlocked ? '🏆' : '🔒'}</div>
                        <h4>${a.title}</h4>
                        <p>${a.desc}</p>
                    </div>
                `;
            }).join('');
        }
    }

    function updateXPDisplay() {
        const profile = typeof Store.getProfile !== 'undefined' ? Store.getProfile() : { level: 1, xp: 0 };
        const xpForNextLevel = profile.level * 1000;
        const progress = Math.min((profile.xp / xpForNextLevel) * 100, 100);

        const lvlEl = document.getElementById('achievements-level');
        const xpTextEl = document.getElementById('achievements-xp-text');
        const xpFillEl = document.getElementById('achievements-xp-fill');

        const sidebarLvlEl = document.getElementById('sidebar-user-level');
        const sidebarXpTextEl = document.getElementById('sidebar-xp-text');
        const sidebarXpFillEl = document.getElementById('sidebar-xp-fill');

        if (lvlEl) lvlEl.textContent = profile.level;
        if (xpTextEl) xpTextEl.textContent = `${profile.xp} / ${xpForNextLevel} XP`;
        if (xpFillEl) xpFillEl.style.width = `${progress}%`;

        if (sidebarLvlEl) sidebarLvlEl.textContent = `Lvl ${profile.level}`;
        if (sidebarXpTextEl) sidebarXpTextEl.textContent = `${profile.xp}/${xpForNextLevel} XP`;
        if (sidebarXpFillEl) sidebarXpFillEl.style.width = `${progress}%`;

        checkAchievements(); // Always check on XP change since actions happen
    }

    return { init, checkAchievements, render, updateXPDisplay };
})();
