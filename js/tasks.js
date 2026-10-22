const Tasks = (() => {
  return {
    init() {
      const addBtns = [
        document.getElementById('btn-add-task'),
        document.getElementById('btn-dashboard-add-task'),
        document.getElementById('btn-add-task-empty')
      ];
      addBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => this.openModal());
      });

      const saveBtn = document.getElementById('task-save');
      if (saveBtn) saveBtn.addEventListener('click', () => this.save());

      const tasksList = document.getElementById('tasks-list');
      if (tasksList) {
        tasksList.addEventListener('click', (e) => {
          const taskItem = e.target.closest('.task-item');
          if (!taskItem) return;
          const taskId = taskItem.dataset.id;
          
          if (e.target.closest('.task-checkbox')) {
            this.toggle(taskId);
          } else if (e.target.closest('.btn-edit-task')) {
            this.edit(taskId);
          } else if (e.target.closest('.btn-delete-task')) {
            this.delete(taskId);
          }
        });
      }

      const filters = document.querySelectorAll('.filter-btn[data-filter]');
      filters.forEach(btn => {
        btn.addEventListener('click', (e) => {
          filters.forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          this.render(e.target.dataset.filter);
        });
      });
    },

    getAll() {
      return Store.get('tasks');
    },

    getTodayTasks() {
      const today = new Date().toISOString().split('T')[0];
      return this.getAll().filter(t => !t.completed && t.date === today);
    },

    getCompletedToday() {
      const today = new Date().toISOString().split('T')[0];
      return this.getAll().filter(t => t.completed && t.completedDate === today);
    },

    getCompletedCount() {
      return this.getAll().filter(t => t.completed).length;
    },

    getWeeklyCompleted() {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return this.getAll().filter(t => t.completed && new Date(t.completedDate) >= oneWeekAgo).length;
    },

    openModal(taskId = null) {
      const titleEl = document.getElementById('modal-task-title');
      const idInput = document.getElementById('task-id');
      const titleInput = document.getElementById('task-title');
      const descInput = document.getElementById('task-description');
      const catInput = document.getElementById('task-category');
      const prioInput = document.getElementById('task-priority');
      const dateInput = document.getElementById('task-date');
      const timeInput = document.getElementById('task-time');
      const deadlineInput = document.getElementById('task-deadline');
      const repeatInput = document.getElementById('task-repeat');

      if (taskId) {
        if (titleEl) titleEl.textContent = 'Edit Task';
        const task = this.getAll().find(t => t.id === taskId);
        if (task) {
          idInput.value = task.id;
          titleInput.value = task.title || '';
          descInput.value = task.description || '';
          catInput.value = task.category || '';
          prioInput.value = task.priority || '';
          dateInput.value = task.date || '';
          timeInput.value = task.time || '';
          deadlineInput.value = task.deadline || '';
          repeatInput.value = task.repeat || 'none';
        }
      } else {
        if (titleEl) titleEl.textContent = 'Add Task';
        idInput.value = '';
        titleInput.value = '';
        descInput.value = '';
        catInput.value = '';
        prioInput.value = 'low';
        dateInput.value = new Date().toISOString().split('T')[0];
        timeInput.value = '';
        deadlineInput.value = '';
        repeatInput.value = 'none';
      }

      App.openModal('modal-task');
    },

    closeModal() {
      App.closeModal('modal-task');
    },

    save() {
      const idInput = document.getElementById('task-id');
      const titleInput = document.getElementById('task-title');
      
      if (!titleInput.value.trim()) {
        Notify.toast('Task title is required', 'error');
        return;
      }

      const taskData = {
        title: titleInput.value.trim(),
        description: document.getElementById('task-description').value,
        category: document.getElementById('task-category').value,
        priority: document.getElementById('task-priority').value,
        date: document.getElementById('task-date').value,
        time: document.getElementById('task-time').value,
        deadline: document.getElementById('task-deadline').value,
        repeat: document.getElementById('task-repeat').value,
      };

      const tasks = this.getAll();
      const isNew = !idInput.value;

      if (isNew) {
        taskData.id = Store.genId('task');
        taskData.completed = false;
        taskData.createdAt = new Date().toISOString();
        tasks.push(taskData);
        Store.addXP(10);
        Store.updateStreak('daily');
        if (typeof Achievements !== 'undefined' && Achievements.updateXPDisplay) {
          Achievements.updateXPDisplay();
        }
        App.updateSidebar();
      } else {
        const index = tasks.findIndex(t => t.id === idInput.value);
        if (index > -1) {
          taskData.id = tasks[index].id;
          taskData.completed = tasks[index].completed;
          taskData.createdAt = tasks[index].createdAt;
          taskData.completedDate = tasks[index].completedDate;
          tasks[index] = taskData;
        }
      }

      Store.set('tasks', tasks);
      this.closeModal();
      Notify.toast(isNew ? 'Task added' : 'Task updated', 'success');
      
      const activeFilter = document.querySelector('.filter-btn[data-filter].active')?.dataset.filter || 'all';
      this.render(activeFilter);
      this.renderDashboard();
    },

    toggle(taskId) {
      const tasks = this.getAll();
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        if (task.completed) {
          task.completedDate = new Date().toISOString().split('T')[0];
          Store.addXP(10);
          Store.updateStreak('daily');
          App.updateSidebar();
          Notify.toast('Task completed! +10 XP', 'success');
        } else {
          task.completedDate = null;
        }
        Store.set('tasks', tasks);
        const activeFilter = document.querySelector('.filter-btn[data-filter].active')?.dataset.filter || 'all';
        this.render(activeFilter);
        this.renderDashboard();
      }
    },

    async delete(taskId) {
      const confirmed = await Notify.confirm('Are you sure you want to delete this task?');
      if (confirmed) {
        let tasks = this.getAll();
        tasks = tasks.filter(t => t.id !== taskId);
        Store.set('tasks', tasks);
        Notify.toast('Task deleted', 'info');
        const activeFilter = document.querySelector('.filter-btn[data-filter].active')?.dataset.filter || 'all';
        this.render(activeFilter);
        this.renderDashboard();
      }
    },

    edit(taskId) {
      this.openModal(taskId);
    },

    render(filter = 'all') {
      const list = document.getElementById('tasks-list');
      if (!list) return;

      let tasks = this.getAll();
      const today = new Date().toISOString().split('T')[0];

      if (filter === 'all') {
        tasks = tasks.filter(t => !t.completed);
      } else if (filter === 'today') {
        tasks = tasks.filter(t => !t.completed && t.date === today);
      } else if (filter === 'upcoming') {
        tasks = tasks.filter(t => !t.completed && t.date > today);
      } else if (filter === 'completed') {
        tasks = tasks.filter(t => t.completed);
      }

      list.innerHTML = '';
      if (tasks.length === 0) {
        list.innerHTML = '<div class="no-data">No tasks found</div>';
        return;
      }

      tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        item.dataset.id = task.id;
        item.innerHTML = `
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
          <div class="task-content">
            <div class="task-title">${task.title}</div>
            ${task.description ? \`<div class="task-desc">\${task.description}</div>\` : ''}
            <div class="task-meta">
              ${task.date ? \`<span>Date: \${task.date}</span>\` : ''}
              ${task.category ? \`<span>Cat: \${task.category}</span>\` : ''}
            </div>
          </div>
          <div class="task-actions">
            <button class="btn-edit-task">Edit</button>
            <button class="btn-delete-task">Delete</button>
          </div>
        `;
        list.appendChild(item);
      });
    },

    renderDashboard() {
      const dashList = document.getElementById('dash-today-tasks');
      if (!dashList) return;

      const todayTasks = this.getTodayTasks();
      dashList.innerHTML = '';

      if (todayTasks.length === 0) {
        dashList.innerHTML = '<div class="no-data">No tasks for today!</div>';
      } else {
        todayTasks.slice(0, 5).forEach(task => {
          const item = document.createElement('div');
          item.className = 'dashboard-task-item';
          item.innerHTML = `
            <span class="dash-task-title">${task.title}</span>
            <span class="dash-task-priority">${task.priority}</span>
          `;
          dashList.appendChild(item);
        });
      }

      const allToday = this.getAll().filter(t => t.date === new Date().toISOString().split('T')[0]);
      const completedToday = allToday.filter(t => t.completed).length;
      const totalToday = allToday.length;

      const countEl = document.getElementById('dash-completed-count');
      if (countEl) countEl.textContent = completedToday;

      let percent = totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100);
      
      const percentEl = document.getElementById('dash-progress-percent');
      if (percentEl) percentEl.textContent = percent + '%';
      
      const detailEl = document.getElementById('dash-progress-detail');
      if (detailEl) detailEl.textContent = `${completedToday} of ${totalToday} tasks`;
      
      const ring = document.getElementById('dash-progress-ring');
      if (ring) {
        const circumference = 326.73;
        const offset = circumference - (percent / 100) * circumference;
        ring.style.strokeDashoffset = offset;
      }
    }
  };
})();
