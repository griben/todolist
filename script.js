let tasks = JSON.parse(localStorage.getItem('my_tasks')) || [];
let currentUser = localStorage.getItem('my_user_name') || null;

const tasksListElement = document.getElementById('tasks-list');
const authModal = document.getElementById('auth-modal');
const editModal = document.getElementById('edit-modal');

function initApp() {
    if (!currentUser) {
        authModal.classList.remove('hidden');
    } else {
        authModal.classList.add('hidden');
        document.getElementById('user-info').classList.remove('hidden');
        document.getElementById('current-user-name').textContent = currentUser;
        renderTasks();
    }
}

document.getElementById('login-btn').addEventListener('click', () => {
    const nameInput = document.getElementById('username-input').value.trim();
    if (nameInput) {
        currentUser = nameInput;
        localStorage.setItem('my_user_name', currentUser);
        initApp();
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('my_user_name');
    location.reload();
});


function saveToStorage() {
    localStorage.setItem('my_tasks', JSON.stringify(tasks));
}

document.getElementById('add-task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newTask = {
        id: Date.now(),
        title: document.getElementById('task-title').value,
        desc: document.getElementById('task-desc').value,
        completed: false,
        completedBy: '',
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveToStorage();
    renderTasks();
    e.target.reset(); 
});

function deleteTask(id) {
    if (confirm('delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveToStorage();
        renderTasks();
    }
}

function toggleComplete(id) {
    tasks = tasks.map(t => {
        if (t.id === id) {
            const newStatus = !t.completed;
            return { 
                ...t, 
                completed: newStatus, 
                completedBy: newStatus ? currentUser : '' 
            };
        }
        return t;
    });
    saveToStorage();
    renderTasks();
}


function renderTasks() {
    const filter = document.getElementById('filter-status').value;
    const sort = document.getElementById('sort-by').value;

    tasksListElement.innerHTML = '';

    let filteredTasks = tasks.filter(t => {
        if (filter === 'completed') return t.completed;
        if (filter === 'uncompleted') return !t.completed;
        return true;
    });

    filteredTasks.sort((a, b) => {
        if (sort === 'title') return a.title.localeCompare(b.title);
        if (sort === 'user') return (a.completedBy || '').localeCompare(b.completedBy || '');
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    filteredTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card ${task.completed ? 'completed' : ''}`;
        card.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.desc}</p>
            <div class="info">
                <small>Status: ${task.completed ? 'Completed' : 'In progress'}</small><br>
                ${task.completedBy ? `<small>Executor: <b>${task.completedBy}</b></small>` : ''}
            </div>
            <div style="margin-top: 15px; display: flex; gap: 5px;">
                <button class="btn-sm btn-primary" onclick="toggleComplete(${task.id})">
                    ${task.completed ? 'Return' : 'Ready'}
                </button>
                <button class="btn-sm btn-secondary" onclick="openEdit(${task.id})">Edit</button>
                <button class="btn-sm btn-danger" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        tasksListElement.appendChild(card);
    });
}


function openEdit(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-title').value = task.title;
    document.getElementById('edit-desc').value = task.desc;
    document.getElementById('edit-status').checked = task.completed;
    document.getElementById('edit-user').value = task.completedBy;
    
    editModal.classList.remove('hidden');
}

document.getElementById('save-edit-btn').addEventListener('click', () => {
    const id = parseInt(document.getElementById('edit-task-id').value);
    const title = document.getElementById('edit-title').value;
    const desc = document.getElementById('edit-desc').value;
    const completed = document.getElementById('edit-status').checked;
    const user = document.getElementById('edit-user').value;

    tasks = tasks.map(t => t.id === id ? {
        ...t, title, desc, completed, completedBy: user
    } : t);

    saveToStorage();
    renderTasks();
    editModal.classList.add('hidden');
});

document.getElementById('close-edit-btn').onclick = () => editModal.classList.add('hidden');

document.getElementById('filter-status').onchange = renderTasks;
document.getElementById('sort-by').onchange = renderTasks;

initApp();
