const Books = (function() {
    function init() {
        const btnAdd = document.getElementById('btn-add-book');
        const btnAddEmpty = document.getElementById('btn-add-book-empty');
        const btnSave = document.getElementById('book-save');
        const searchInput = document.getElementById('books-search-input');
        
        if (btnAdd) btnAdd.addEventListener('click', () => openModal());
        if (btnAddEmpty) btnAddEmpty.addEventListener('click', () => openModal());
        if (btnSave) btnSave.addEventListener('click', save);
        if (searchInput) searchInput.addEventListener('input', () => render(searchInput.value));

        const filters = document.querySelectorAll('#page-books .filter-btn[data-filter]');
        filters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filters.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                render(searchInput ? searchInput.value : '', e.target.dataset.filter);
            });
        });

        const grid = document.getElementById('books-grid');
        if (grid) {
            grid.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.book-edit');
                const deleteBtn = e.target.closest('.book-delete');
                if (editBtn) openModal(editBtn.dataset.id);
                if (deleteBtn) {
                    Notify.confirm('Delete this book?').then(confirmed => {
                        if (!confirmed) return;
                        let books = Store.get('books') || [];
                        books = books.filter(b => b.id !== deleteBtn.dataset.id);
                        Store.set('books', books);
                        render();
                    });
                }
            });
        }
    }

    function openModal(bookId = null) {
        const titleEl = document.getElementById('modal-book-title');
        const idInput = document.getElementById('book-id');
        const titleInput = document.getElementById('book-title');
        const authorInput = document.getElementById('book-author');
        const coverInput = document.getElementById('book-cover');
        const statusInput = document.getElementById('book-status');
        const ratingInput = document.getElementById('book-rating');
        const descInput = document.getElementById('book-description');
        const notesInput = document.getElementById('book-notes');

        if (bookId) {
            const books = Store.get('books') || [];
            const book = books.find(b => b.id === bookId);
            if (book) {
                if (titleEl) titleEl.textContent = 'Edit Book';
                idInput.value = book.id;
                titleInput.value = book.title;
                authorInput.value = book.author || '';
                coverInput.value = book.cover || '';
                statusInput.value = book.status;
                ratingInput.value = book.rating || '0';
                descInput.value = book.description || '';
                notesInput.value = book.notes || '';
            }
        } else {
            if (titleEl) titleEl.textContent = 'Add Book';
            idInput.value = '';
            titleInput.value = '';
            authorInput.value = '';
            coverInput.value = '';
            statusInput.value = 'want-to-read';
            ratingInput.value = '0';
            descInput.value = '';
            notesInput.value = '';
        }

        App.openModal('modal-book');
    }

    function save() {
        const id = document.getElementById('book-id').value;
        const title = document.getElementById('book-title').value.trim();
        const author = document.getElementById('book-author').value.trim();
        const cover = document.getElementById('book-cover').value.trim();
        const status = document.getElementById('book-status').value;
        const rating = parseInt(document.getElementById('book-rating').value) || 0;
        const description = document.getElementById('book-description').value.trim();
        const notes = document.getElementById('book-notes').value.trim();

        if (!title) {
            alert('Title is required');
            return;
        }

        let books = Store.get('books') || [];
        let book = books.find(b => b.id === id);
        let isNew = !book;
        let wasCompleted = book ? book.status === 'completed' : false;

        if (isNew) {
            book = { id: Store.genId('book'), createdAt: new Date().toISOString() };
            books.push(book);
        }

        book.title = title;
        book.author = author;
        book.cover = cover;
        book.status = status;
        book.rating = rating;
        book.description = description;
        book.notes = notes;
        book.updatedAt = new Date().toISOString();

        Store.set('books', books);
        App.closeModal('modal-book');
        
        if (status === 'completed' && !wasCompleted) {
            Store.addXP(100);
            Store.updateStreak('reading');
            if (typeof Achievements !== 'undefined') Achievements.updateXPDisplay();
            Toast.show('Book completed! +100 XP');
        } else {
            Toast.show('Book saved');
        }

        render();
    }

    function render(searchQuery = '', filterStatus = 'all') {
        let books = getAll();
        
        const countEl = document.getElementById('books-completed-count');
        if (countEl) countEl.textContent = getCompletedCount();

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            books = books.filter(b => b.title.toLowerCase().includes(q) || (b.author && b.author.toLowerCase().includes(q)));
        }

        if (filterStatus && filterStatus !== 'all') {
            books = books.filter(b => b.status === filterStatus);
        }

        const grid = document.getElementById('books-grid');

        if (!grid) return;

        if (books.length === 0) {
            grid.innerHTML = '<div class="empty-state"><p>No books found.</p><button id="btn-add-book-empty" class="btn btn-primary">+ Add Book</button></div>';
            const btn = document.getElementById('btn-add-book-empty');
            if (btn) btn.addEventListener('click', () => openModal());
        } else {
            grid.innerHTML = books.map(b => `
                <div class="book-card">
                    <div class="book-cover-wrap">
                        ${b.cover ? `<img src="${b.cover}" alt="${b.title} cover">` : `<div class="no-cover">No Cover</div>`}
                    </div>
                    <div class="book-info">
                        <h3>${b.title}</h3>
                        <p>${b.author || 'Unknown Author'}</p>
                        <p class="book-status ${b.status}">${b.status.replace('-', ' ')}</p>
                        <div class="book-actions">
                            <button class="book-edit" data-id="${b.id}">Edit</button>
                            <button class="book-delete" data-id="${b.id}">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    function getAll() {
        return Store.get('books') || [];
    }

    function getByStatus(status) {
        return getAll().filter(b => b.status === status);
    }

    function getCompletedCount() {
        return getByStatus('completed').length;
    }

    function getReading() {
        return getByStatus('reading');
    }

    return { init, openModal, save, render, getAll, getByStatus, getCompletedCount, getReading };
})();
