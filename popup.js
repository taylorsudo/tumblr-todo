document.addEventListener('DOMContentLoaded', loadTasks);
document.getElementById('addTask').addEventListener('click', addTask);
document.getElementById('newTask').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

function loadTasks() {
  chrome.storage.local.get(['tasks'], (result) => {
    const tasks = result.tasks || [];
    displayTasks(tasks);
  });
}

function displayTasks(tasks) {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(index));

    const span = document.createElement('span');
    span.className = 'task-text' + (task.completed ? ' completed' : '');
    span.textContent = task.text;
    span.addEventListener('dblclick', () => editTask(index));

    const editBtn = document.createElement('button');
    editBtn.textContent = 'edit';
    editBtn.addEventListener('click', () => editTask(index));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'delete';
    deleteBtn.addEventListener('click', () => deleteTask(index));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

function addTask() {
  const input = document.getElementById('newTask');
  const text = input.value.trim();
  if (text) {
    chrome.storage.local.get(['tasks'], (result) => {
      const tasks = result.tasks || [];
      tasks.push({ text, completed: false });
      chrome.storage.local.set({ tasks }, () => {
        input.value = '';
        loadTasks();
      });
    });
  }
}

function deleteTask(index) {
  chrome.storage.local.get(['tasks'], (result) => {
    const tasks = result.tasks || [];
    tasks.splice(index, 1);
    chrome.storage.local.set({ tasks }, loadTasks);
  });
}

function editTask(index) {
  chrome.storage.local.get(['tasks'], (result) => {
    const tasks = result.tasks || [];
    const newText = prompt('Edit task:', tasks[index].text);
    if (newText !== null) {
      tasks[index].text = newText.trim();
      chrome.storage.local.set({ tasks }, loadTasks);
    }
  });
}

function toggleTask(index) {
  chrome.storage.local.get(['tasks'], (result) => {
    const tasks = result.tasks || [];
    tasks[index].completed = !tasks[index].completed;
    chrome.storage.local.set({ tasks }, loadTasks);
  });
}