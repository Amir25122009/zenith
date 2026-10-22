const Notes = (function() {
    function init() {
        const btnAdd = document.getElementById('btn-add-note');
        const btnAddEmpty = document.getElementById('btn-add-note-empty');
        const btnSave = document.getElementById('note-save');
        const searchInput = document.getElementById('notes-search-input');
        
        if (btnAdd) btnAdd.addEventListener('click', () => openModal());
        if (btnAddEmpty) btnAddEmpty.addEventListener('click', () => openModal());
        if (btnSave) btnSave.addEventListener('click', save);
        if (searchInput) searchInput.addEventListener('input', render);

        const list = document.getElementById('notes-list');
        if (list) {
            list.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.note-edit');
                const deleteBtn = e.target.closest('.note-delete');
                if (editBtn) openModal(editBtn.dataset.id);
                if (deleteBtn) {
                    Notify.confirm('Delete this note?').then(confirmed => {
                        if (!confirmed) return;
                        let notes = Store.get('notes') || [];
                        notes = notes.filter(n => n.id !== deleteBtn.dataset.id);
                        Store.set('notes', notes);
                        render();
                    });
                }
            });
        }
    }

    function openModal(noteId = null) {
        const titleEl = document.getElementById('modal-note-title');
        const idInput = document.getElementById('note-id');
        const titleInput = document.getElementById('note-title');
        const textInput = document.getElementById('note-text');
        const catInput = document.getElementById('note-category');
        const tagsInput = document.getElementById('note-tags');

        if (noteId) {
            const notes = Store.get('notes') || [];
            const note = notes.find(n => n.id === noteId);
            if (note) {
                if (titleEl) titleEl.textContent = 'Edit Note';
                idInput.value = note.id;
                titleInput.value = note.title;
                textInput.value = note.text;
                catInput.value = note.category;
                tagsInput.value = note.tags ? note.tags.join(', ') : '';
            }
        } else {
            if (titleEl) titleEl.textContent = 'Add Note';
            idInput.value = '';
            titleInput.value = '';
            textInput.value = '';
            catInput.value = 'general';
            tagsInput.value = '';
        }

        App.openModal('modal-note');
    }

    function save() {
        const id = document.getElementById('note-id').value;
        const title = document.getElementById('note-title').value.trim();
        const text = document.getElementById('note-text').value.trim();
        const category = document.getElementById('note-category').value;
        const tagsStr = document.getElementById('note-tags').value;

        if (!title || !text) {
            alert('Title and text are required');
            return;
        }

        const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);
        
        let notes = Store.get('notes') || [];
        let note = notes.find(n => n.id === id);
        let isNew = !note;

        if (isNew) {
            note = { id: Store.genId('note'), createdAt: new Date().toISOString() };
            notes.push(note);
        }

        note.title = title;
        note.text = text;
        note.category = category;
        note.tags = tags;
        note.updatedAt = new Date().toISOString();

        Store.set('notes', notes);
        App.closeModal('modal-note');
        Toast.show('Note saved');
        render();
    }

    function render() {
        const searchInput = document.getElementById('notes-search-input');
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        
        let notes = getAll();

        if (query) {
            notes = notes.filter(n => 
                n.title.toLowerCase().includes(query) || 
                n.text.toLowerCase().includes(query) ||
                (n.tags && n.tags.some(t => t.toLowerCase().includes(query)))
            );
        }

        const list = document.getElementById('notes-list');
        if (!list) return;

        if (notes.length === 0) {
            list.innerHTML = '<p>No notes found.</p>';
        } else {
            list.innerHTML = notes.map(n => `
                <div class="note-card">
                    <h3>${n.title}</h3>
                    <div class="note-category badge">${n.category}</div>
                    <p class="note-preview">${n.text.substring(0, 100)}${n.text.length > 100 ? '...' : ''}</p>
                    <div class="note-tags">${(n.tags || []).map(t => `<span class="tag">#${t}</span>`).join(' ')}</div>
                    <div class="note-actions">
                        <button class="note-edit" data-id="${n.id}">Edit</button>
                        <button class="note-delete" data-id="${n.id}">Delete</button>
                    </div>
                </div>
            `).join('');
        }
    }

    function getAll() {
        const notes = Store.get('notes') || [];
        return notes.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }

    return { init, openModal, save, render, getAll };
})();
