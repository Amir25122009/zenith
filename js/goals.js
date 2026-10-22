const Goals = (() => {
  return {
    init() {
      const addBtns = [
        document.getElementById('btn-add-goal'),
        document.getElementById('btn-add-goal-empty')
      ];
      addBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => this.openModal());
      });

      const saveBtn = document.getElementById('goal-save');
      if (saveBtn) saveBtn.addEventListener('click', () => this.save());

      const goalsList = document.getElementById('goals-list');
      if (goalsList) {
        goalsList.addEventListener('click', (e) => {
          const goalItem = e.target.closest('.goal-item');
          if (!goalItem) return;
          const goalId = goalItem.dataset.id;
          
          if (e.target.closest('.btn-edit-goal')) {
            this.openModal(goalId);
          } else if (e.target.closest('.btn-delete-goal')) {
            this.delete(goalId);
          } else if (e.target.closest('.btn-add-milestone')) {
            const mTitle = prompt('Milestone title:');
            if (mTitle) this.addMilestone(goalId, mTitle);
          } else if (e.target.closest('.milestone-checkbox')) {
            const mIndex = e.target.dataset.index;
            this.toggleMilestone(goalId, parseInt(mIndex, 10));
          }
        });
      }
    },

    getAll() {
      return Store.get('goals');
    },

    getCompletedCount() {
      return this.getAll().filter(g => parseFloat(g.currentValue) >= parseFloat(g.targetValue)).length;
    },

    openModal(goalId = null) {
      const titleEl = document.getElementById('modal-goal-title');
      const idInput = document.getElementById('goal-id');
      const titleInput = document.getElementById('goal-title');
      const catInput = document.getElementById('goal-category');
      const currentInput = document.getElementById('goal-current');
      const targetInput = document.getElementById('goal-target');
      const deadlineInput = document.getElementById('goal-deadline');

      if (goalId) {
        if (titleEl) titleEl.textContent = 'Edit Goal';
        const goal = this.getAll().find(g => g.id === goalId);
        if (goal) {
          idInput.value = goal.id;
          titleInput.value = goal.title || '';
          catInput.value = goal.category || '';
          currentInput.value = goal.currentValue || 0;
          targetInput.value = goal.targetValue || 0;
          deadlineInput.value = goal.deadline || '';
        }
      } else {
        if (titleEl) titleEl.textContent = 'Add Goal';
        idInput.value = '';
        titleInput.value = '';
        catInput.value = '';
        currentInput.value = 0;
        targetInput.value = 100;
        deadlineInput.value = '';
      }

      App.openModal('modal-goal');
    },

    closeModal() {
      App.closeModal('modal-goal');
    },

    save() {
      const idInput = document.getElementById('goal-id');
      const titleInput = document.getElementById('goal-title');
      
      if (!titleInput.value.trim()) {
        Notify.toast('Goal title is required', 'error');
        return;
      }

      const goalData = {
        title: titleInput.value.trim(),
        category: document.getElementById('goal-category').value,
        currentValue: parseFloat(document.getElementById('goal-current').value) || 0,
        targetValue: parseFloat(document.getElementById('goal-target').value) || 0,
        deadline: document.getElementById('goal-deadline').value,
      };

      const goals = this.getAll();
      const isNew = !idInput.value;

      if (isNew) {
        goalData.id = Store.genId('goal');
        goalData.milestones = [];
        goalData.createdAt = new Date().toISOString();
        goals.push(goalData);
      } else {
        const index = goals.findIndex(g => g.id === idInput.value);
        if (index > -1) {
          goalData.id = goals[index].id;
          goalData.milestones = goals[index].milestones || [];
          goalData.createdAt = goals[index].createdAt;
          goals[index] = goalData;
        }
      }

      Store.set('goals', goals);
      this.closeModal();
      Notify.toast(isNew ? 'Goal added' : 'Goal updated', 'success');
      
      this.render();
      this.renderDashboard();
    },

    async delete(goalId) {
      const confirmed = await Notify.confirm('Are you sure you want to delete this goal?');
      if (confirmed) {
        let goals = this.getAll();
        goals = goals.filter(g => g.id !== goalId);
        Store.set('goals', goals);
        Notify.toast('Goal deleted', 'info');
        this.render();
        this.renderDashboard();
      }
    },

    updateProgress(goalId, newCurrent) {
      const goals = this.getAll();
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        goal.currentValue = newCurrent;
        Store.set('goals', goals);
        this.render();
        this.renderDashboard();
      }
    },

    addMilestone(goalId, title) {
      const goals = this.getAll();
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        if (!goal.milestones) goal.milestones = [];
        goal.milestones.push({ title, completed: false });
        Store.set('goals', goals);
        this.render();
      }
    },

    toggleMilestone(goalId, milestoneIndex) {
      const goals = this.getAll();
      const goal = goals.find(g => g.id === goalId);
      if (goal && goal.milestones && goal.milestones[milestoneIndex]) {
        goal.milestones[milestoneIndex].completed = !goal.milestones[milestoneIndex].completed;
        Store.set('goals', goals);
        this.render();
      }
    },

    render() {
      const list = document.getElementById('goals-list');
      if (!list) return;

      const goals = this.getAll();
      list.innerHTML = '';
      
      if (goals.length === 0) {
        list.innerHTML = '<div class="no-data">No goals found</div>';
        return;
      }

      goals.forEach(goal => {
        let progress = 0;
        if (goal.targetValue > 0) {
          progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
        }
        
        const item = document.createElement('div');
        item.className = 'goal-item';
        item.dataset.id = goal.id;
        
        let milestonesHtml = '';
        if (goal.milestones && goal.milestones.length > 0) {
          milestonesHtml = '<div class="milestones-list">';
          goal.milestones.forEach((m, idx) => {
            milestonesHtml += `
              <div class="milestone-item">
                <input type="checkbox" class="milestone-checkbox" data-index="${idx}" ${m.completed ? 'checked' : ''}>
                <span>${m.title}</span>
              </div>
            `;
          });
          milestonesHtml += '</div>';
        }
        
        item.innerHTML = `
          <div class="goal-header">
            <h3>${goal.title}</h3>
            <div class="goal-actions">
              <button class="btn-edit-goal">Edit</button>
              <button class="btn-delete-goal">Delete</button>
            </div>
          </div>
          <div class="goal-stats">
            Progress: ${goal.currentValue} / ${goal.targetValue} (${progress}%)
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${progress}%; background: ${progress === 100 ? 'green' : 'blue'};"></div>
          </div>
          ${milestonesHtml}
          <button class="btn-add-milestone">Add Milestone</button>
        `;
        list.appendChild(item);
      });
    },

    renderDashboard() {
      const preview = document.getElementById('dash-goals-preview');
      if (!preview) return;

      const goals = this.getAll();
      preview.innerHTML = '';

      if (goals.length === 0) {
        preview.innerHTML = '<div class="no-data">No active goals.</div>';
        return;
      }

      goals.slice(0, 3).forEach(goal => {
        let progress = 0;
        if (goal.targetValue > 0) {
          progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
        }
        const item = document.createElement('div');
        item.className = 'dash-goal-item';
        item.innerHTML = `
          <div class="dash-goal-header">
            <span>${goal.title}</span>
            <span>${progress}%</span>
          </div>
          <div class="progress-bar-container" style="height: 6px; background: #eee; border-radius: 3px; overflow: hidden; margin-top: 5px;">
            <div style="height: 100%; width: ${progress}%; background: blue;"></div>
          </div>
        `;
        preview.appendChild(item);
      });
    }
  };
})();
