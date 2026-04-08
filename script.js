document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const taskCount = document.getElementById('task-count');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const emptyState = document.getElementById('empty-state');

    // Local Storage Key
    const STORAGE_KEY = 'taskmaster_todos';

    // State
    let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Initialize App
    function init() {
        renderTodos();
        updateFooter();
    }

    // Save to Local Storage
    function saveTodos() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        updateFooter();
    }

    // Render Todos to DOM
    function renderTodos() {
        todoList.innerHTML = '';
        
        if (todos.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            
            todos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                li.setAttribute('data-id', todo.id);

                li.innerHTML = `
                    <div class="task-content">
                        <input type="checkbox" class="checkbox" ${todo.completed ? 'checked' : ''} aria-label="Mark task complete">
                        <span class="task-text" title="${escapeHtml(todo.text)}">${escapeHtml(todo.text)}</span>
                    </div>
                    <button class="delete-btn" aria-label="Delete task">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                `;

                // Add event listeners to newly created elements
                const checkbox = li.querySelector('.checkbox');
                checkbox.addEventListener('change', () => toggleTodo(todo.id));

                const deleteBtn = li.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

                todoList.appendChild(li);
            });
        }
    }

    // Add New Todo
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        
        if (text) {
            const newTodo = {
                id: Date.now().toString(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            todos.push(newTodo);
            saveTodos();
            renderTodos();
            todoInput.value = '';
        }
    });

    // Toggle Todo Completion
    function toggleTodo(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        saveTodos();
        renderTodos();
    }

    // Delete Todo
    function deleteTodo(id) {
        // Add fade out animation class to corresponding element
        const li = document.querySelector(`li[data-id="${id}"]`);
        if (li) {
            li.style.opacity = '0';
            li.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                todos = todos.filter(todo => todo.id !== id);
                saveTodos();
                renderTodos();
            }, 200); // Wait for transition
        } else {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
        }
    }

    // Clear Completed Todos
    clearCompletedBtn.addEventListener('click', () => {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
    });

    // Update Footer Metrics
    function updateFooter() {
        const activeTodos = todos.filter(todo => !todo.completed).length;
        const totalCompleted = todos.length - activeTodos;
        
        // Update task count text
        if (todos.length === 0) {
            taskCount.textContent = 'No tasks yet';
        } else if (activeTodos === 1) {
            taskCount.textContent = '1 task left';
        } else {
            taskCount.textContent = `${activeTodos} tasks left`;
        }

        // Show/Hide Clear Completed Button
        if (totalCompleted > 0) {
            clearCompletedBtn.classList.remove('hidden');
        } else {
            clearCompletedBtn.classList.add('hidden');
        }
    }

    // Simple HTML escaper to prevent XSS
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Run Initialization
    init();
});
