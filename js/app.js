const App = (() => {
  return {
    init() {
      // Modals
      const closeButtons = document.querySelectorAll('.modal-close');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const modal = e.target.closest('.modal');
          if (modal) this.closeModal(modal.id);
        });
      });
      
      const overlay = document.getElementById('modal-overlay');
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) this.closeAllModals();
        });
      }

      // Navigation
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const page = e.currentTarget.dataset.page;
          if (page) this.navigate(page);
        });
      });

      // Settings form
      const settingsForm = document.getElementById('settings-form');
      if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const profile = Store.getProfile();
          profile.name = document.getElementById('settings-name').value;
          profile.mainGoal = document.getElementById('settings-main-goal').value;
          profile.studyTarget = parseFloat(document.getElementById('settings-study-target').value) || 0;
          profile.satTarget = parseInt(document.getElementById('settings-sat-target').value, 10) || 0;
          profile.preferredStudyTime = document.getElementById('settings-study-time').value;
          
          Store.setObject('profile', profile);
          this.updateSidebar();
          Notify.toast('Settings saved', 'success');
        });
      }

      // Theme
      const darkToggle = document.getElementById('dark-mode-toggle');
      const settingsDarkToggle = document.getElementById('settings-dark-toggle');
      
      const toggleTheme = (isDark) => {
        const settings = Store.getSettings();
        settings.darkMode = isDark;
        Store.setObject('settings', settings);
        document.body.classList.toggle('dark-mode', isDark);
        if (darkToggle) darkToggle.checked = isDark;
        if (settingsDarkToggle) settingsDarkToggle.checked = isDark;
      };

      const initSettings = Store.getSettings();
      toggleTheme(initSettings.darkMode);

      if (darkToggle) darkToggle.addEventListener('change', (e) => toggleTheme(e.target.checked));
      if (settingsDarkToggle) settingsDarkToggle.addEventListener('change', (e) => toggleTheme(e.target.checked));

      // Data management
      const exportBtn = document.getElementById('btn-export-data');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          const data = Store.exportData();
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'zenith_backup.json';
          a.click();
          URL.revokeObjectURL(url);
        });
      }

      const clearBtn = document.getElementById('btn-clear-data');
      if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
          const confirmed = await Notify.confirm('Are you sure you want to delete ALL data? This cannot be undone.');
          if (confirmed) {
            Store.clearAll();
            window.location.reload();
          }
        });
      }

      // Search
      const searchOverlay = document.getElementById('search-overlay');
      const searchInput = document.getElementById('search-input');
      const searchResults = document.getElementById('search-results');
      
      const openSearch = () => {
        if (searchOverlay) {
          searchOverlay.classList.add('active');
          if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
            if (searchResults) searchResults.innerHTML = '';
          }
        }
      };
      
      const closeSearch = () => {
        if (searchOverlay) searchOverlay.classList.remove('active');
      };

      document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
          e.preventDefault();
          openSearch();
        }
        if (e.key === 'Escape') {
          closeSearch();
          this.closeAllModals();
        }
      });
      
      if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
          if (e.target === searchOverlay) closeSearch();
        });
      }

      const globalSearchBtn = document.getElementById('global-search-btn');
      const mobileSearchBtn = document.getElementById('mobile-search-btn');
      if (globalSearchBtn) globalSearchBtn.addEventListener('click', openSearch);
      if (mobileSearchBtn) mobileSearchBtn.addEventListener('click', openSearch);

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.search(e.target.value);
        });
      }

      // Initialize modules
      if (typeof Notify !== 'undefined' && Notify.init) Notify.init();
      if (typeof Tasks !== 'undefined' && Tasks.init) Tasks.init();
      if (typeof Goals !== 'undefined' && Goals.init) Goals.init();

      this.updateSidebar();
      this.navigate('dashboard');
    },

    openModal(modalId) {
      const modal = document.getElementById(modalId);
      const overlay = document.getElementById('modal-overlay');
      if (modal && overlay) {
        overlay.classList.add('active');
        modal.classList.add('active');
      }
    },

    closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('active');
      
      const activeModals = document.querySelectorAll('.modal.active');
      if (activeModals.length === 0) {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.classList.remove('active');
      }
    },

    closeAllModals() {
      const activeModals = document.querySelectorAll('.modal.active');
      activeModals.forEach(m => m.classList.remove('active'));
      const overlay = document.getElementById('modal-overlay');
      if (overlay) overlay.classList.remove('active');
    },

    navigate(pageId) {
      const pages = document.querySelectorAll('.page');
      pages.forEach(p => p.classList.remove('active'));
      
      const targetPage = document.getElementById(`page-${pageId}`);
      if (targetPage) targetPage.classList.add('active');

      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        if (link.dataset.page === pageId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      if (pageId === 'dashboard') {
        if (typeof Tasks !== 'undefined' && Tasks.renderDashboard) Tasks.renderDashboard();
        if (typeof Goals !== 'undefined' && Goals.renderDashboard) Goals.renderDashboard();
        this.updateDashboardStats();
      } else if (pageId === 'tasks') {
        if (typeof Tasks !== 'undefined' && Tasks.render) Tasks.render();
      } else if (pageId === 'goals') {
        if (typeof Goals !== 'undefined' && Goals.render) Goals.render();
      } else if (pageId === 'settings') {
        this.loadSettings();
      }
      
      // Optional modules
      if (pageId === 'progress' && typeof Analytics !== 'undefined' && Analytics.render) Analytics.render();
      if (pageId === 'sat' && typeof SAT !== 'undefined' && SAT.render) SAT.render();
      if (pageId === 'books' && typeof Books !== 'undefined' && Books.render) Books.render();
      if (pageId === 'study' && typeof Study !== 'undefined' && Study.render) Study.render();
      if (pageId === 'calendar' && typeof Calendar !== 'undefined' && Calendar.render) Calendar.render();
      if (pageId === 'notes' && typeof Notes !== 'undefined' && Notes.render) Notes.render();
      if (pageId === 'achievements' && typeof Achievements !== 'undefined' && Achievements.render) Achievements.render();
      
      const pageTitle = document.querySelector('.header-title h1');
      if (pageTitle) {
        pageTitle.textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);
      }
    },

    updateDashboardStats() {
      const streaks = Store.getStreaks();
      const streakEl = document.getElementById('dash-streak');
      if (streakEl) streakEl.textContent = streaks.daily.current;

      const satEl = document.getElementById('dash-sat-latest');
      if (satEl) {
        satEl.textContent = typeof SAT !== 'undefined' && SAT.getLatest() ? SAT.getLatest().total : '—';
      }

      const studyWeekEl = document.getElementById('dash-study-week');
      if (studyWeekEl) {
        if (typeof Study !== 'undefined') {
          const total = Study.getWeekTotal();
          studyWeekEl.textContent = `${total.hours}h ${total.minutes}m`;
        } else {
          studyWeekEl.textContent = '0h 0m';
        }
      }

      const recommendationsEl = document.getElementById('dash-recommendations');
      if (recommendationsEl) {
        if (typeof AI !== 'undefined') {
          recommendationsEl.innerHTML = AI.getRecommendations();
        } else {
          recommendationsEl.innerHTML = '<p>No recommendations currently.</p>';
        }
      }

      const booksPreviewEl = document.getElementById('dash-books-preview');
      if (booksPreviewEl) {
        booksPreviewEl.innerHTML = '';
        if (typeof Books !== 'undefined') {
          const reading = Books.getReading();
          if (reading.length > 0) {
            reading.slice(0, 3).forEach(b => {
              const bEl = document.createElement('div');
              bEl.textContent = b.title;
              booksPreviewEl.appendChild(bEl);
            });
          } else {
             booksPreviewEl.innerHTML = '<p>No books currently reading.</p>';
          }
        } else {
          booksPreviewEl.innerHTML = '<p>No books currently reading.</p>';
        }
      }
    },

    updateSidebar() {
      const profile = Store.getProfile();
      const nameEl = document.getElementById('sidebar-user-name');
      const levelEl = document.getElementById('sidebar-user-level');
      const xpFillEl = document.getElementById('sidebar-xp-fill');
      const xpTextEl = document.getElementById('sidebar-xp-text');

      if (nameEl) nameEl.textContent = profile.name;
      if (levelEl) levelEl.textContent = `Level ${profile.level}`;
      
      const xpNext = profile.level * 200;
      if (xpTextEl) xpTextEl.textContent = `${profile.xp} / ${xpNext} XP`;
      if (xpFillEl) {
        const percent = Math.min(100, (profile.xp / xpNext) * 100);
        xpFillEl.style.width = `${percent}%`;
      }
    },

    loadSettings() {
      const profile = Store.getProfile();
      const nameEl = document.getElementById('settings-name');
      const mainGoalEl = document.getElementById('settings-main-goal');
      const studyTargetEl = document.getElementById('settings-study-target');
      const satTargetEl = document.getElementById('settings-sat-target');
      const studyTimeEl = document.getElementById('settings-study-time');

      if (nameEl) nameEl.value = profile.name || '';
      if (mainGoalEl) mainGoalEl.value = profile.mainGoal || '';
      if (studyTargetEl) studyTargetEl.value = profile.studyTarget || 0;
      if (satTargetEl) satTargetEl.value = profile.satTarget || 0;
      if (studyTimeEl) studyTimeEl.value = profile.preferredStudyTime || 'morning';
    },

    search(query) {
      const resultsContainer = document.getElementById('search-results');
      if (!resultsContainer) return;
      
      if (!query || query.trim() === '') {
        resultsContainer.innerHTML = '';
        return;
      }
      
      query = query.toLowerCase();
      let resultsHtml = '';
      
      // Search tasks
      const tasks = Store.get('tasks').filter(t => t.title && t.title.toLowerCase().includes(query));
      tasks.forEach(t => {
        resultsHtml += `<div class="search-result-item" onclick="App.navigate('tasks'); document.getElementById('search-overlay').classList.remove('active');">Task: ${t.title}</div>`;
      });
      
      // Search goals
      const goals = Store.get('goals').filter(g => g.title && g.title.toLowerCase().includes(query));
      goals.forEach(g => {
        resultsHtml += `<div class="search-result-item" onclick="App.navigate('goals'); document.getElementById('search-overlay').classList.remove('active');">Goal: ${g.title}</div>`;
      });
      
      if (resultsHtml === '') {
        resultsHtml = '<div class="search-no-results">No results found.</div>';
      }
      
      resultsContainer.innerHTML = resultsHtml;
    }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
