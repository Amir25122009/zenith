const Notify = (() => {
  return {
    toast(message, type = 'info', duration = 3000) {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close">&times;</button>
      `;
      container.appendChild(toast);
      
      const closeBtn = toast.querySelector('.toast-close');
      const removeToast = () => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      };
      
      closeBtn.addEventListener('click', removeToast);
      setTimeout(removeToast, duration);
    },

    confirm(message) {
      return new Promise((resolve) => {
        const confirmMsg = document.getElementById('confirm-message');
        if (confirmMsg) confirmMsg.textContent = message;
        
        if (typeof App !== 'undefined' && App.openModal) {
          App.openModal('modal-confirm');
        }
        
        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');
        
        const handleYes = () => { cleanup(); resolve(true); };
        const handleNo = () => { cleanup(); resolve(false); };
        
        const cleanup = () => {
          yesBtn.removeEventListener('click', handleYes);
          noBtn.removeEventListener('click', handleNo);
          if (typeof App !== 'undefined' && App.closeModal) {
            App.closeModal('modal-confirm');
          }
        };
        
        if (yesBtn) yesBtn.addEventListener('click', handleYes);
        if (noBtn) noBtn.addEventListener('click', handleNo);
      });
    },

    addNotification(message, type = 'info') {
      const notifs = Store.get('notifications');
      notifs.push({ id: Store.genId('notif'), message, type, date: new Date().toISOString(), read: false });
      Store.set('notifications', notifs);
      
      const badge = document.getElementById('notification-badge');
      if (badge) {
        const unreadCount = notifs.filter(n => !n.read).length;
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
      }
      
      this.renderNotifications();
    },

    renderNotifications() {
      const list = document.getElementById('notifications-list');
      if (!list) return;
      
      const notifs = Store.get('notifications');
      list.innerHTML = '';
      
      if (notifs.length === 0) {
        list.innerHTML = '<div class="no-notifications">No notifications</div>';
        return;
      }
      
      notifs.slice().reverse().forEach(notif => {
        const item = document.createElement('div');
        item.className = `notification-item ${notif.read ? 'read' : 'unread'}`;
        item.innerHTML = `
          <div class="notification-content">${notif.message}</div>
          <div class="notification-date">${new Date(notif.date).toLocaleString()}</div>
        `;
        list.appendChild(item);
      });
    },

    init() {
      const btn = document.getElementById('notifications-btn');
      const panel = document.getElementById('notifications-panel');
      const clearBtn = document.getElementById('clear-notifications');
      
      if (btn && panel) {
        btn.addEventListener('click', () => {
          panel.classList.toggle('active');
          const notifs = Store.get('notifications');
          let updated = false;
          notifs.forEach(n => { if (!n.read) { n.read = true; updated = true; } });
          if (updated) {
            Store.set('notifications', notifs);
            const badge = document.getElementById('notification-badge');
            if (badge) badge.style.display = 'none';
            this.renderNotifications();
          }
        });
      }
      
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          Store.set('notifications', []);
          this.renderNotifications();
        });
      }
      
      const badge = document.getElementById('notification-badge');
      if (badge) {
        const notifs = Store.get('notifications');
        const unreadCount = notifs.filter(n => !n.read).length;
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
      }
      
      this.renderNotifications();
    },

    checkReminders() {
      const tasks = Store.get('tasks');
      const today = new Date();
      tasks.forEach(task => {
        if (!task.completed && task.deadline) {
          const deadline = new Date(task.deadline);
          const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            this.addNotification(`Task "${task.title}" is due tomorrow!`, 'warning');
          }
        }
      });
    }
  };
})();
