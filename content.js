function replaceTrendingWithTodo() {
  const observer = new MutationObserver(() => {
    const trendingSection = document.querySelector('.Qihwb');
    if (trendingSection && !document.getElementById('todo-container')) {
      trendingSection.innerHTML = `
        <div id="todo-container" style="width: 100%; color: var(--chrome-fg); padding: 12px; font-family: var(--font-family);">
          <h2 style="font-size: 1.25rem; margin-bottom: 12px;">To-Do List</h2>
          <div id="todo-content"></div>
          <div style="display: flex; gap: 6px; margin-top: 12px;">
            <input id="new-task-input" type="text" placeholder="Add a new task..." 
              style="flex: 1; padding: 6px; border: 1px solid #ccc; border-radius: 4px;">
            <button id="add-task-btn" 
              style="padding: 6px 10px; background: var(--chrome-ui); color: var(--chrome-ui-fg); font-weight: 700; border: none; cursor: pointer; border-radius: 4px;">
              Add
            </button>
          </div>
        </div>
      `;
      loadAndDisplayTasks();
      setupTaskInput();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function loadAndDisplayTasks() {
  chrome.storage.local.get(['tasks'], (result) => {
    const tasks = result.tasks || [];
    const container = document.getElementById('todo-content');
    if (!container) return;

    container.innerHTML = tasks.length > 0
      ? tasks.map((task, index) => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 0;">
            <span class="task-item" data-index="${index}" style="cursor: pointer; flex-grow: 1; ${task.completed ? 'text-decoration: line-through; color: #666' : ''}">
              ${task.text}
            </span>
            <button class="delete-task-btn" data-index="${index}" 
              style="font-size: 1.5em; color: var(--chrome-fg); border: none; cursor: pointer; border-radius: 4px; padding: 2px 6px;">
              ×
            </button>
          </div>
        `).join('')
      : '<div style="color: #666">No tasks yet - add some using the input below!</div>';

    setupTaskActions();
  });
}

function setupTaskInput() {
  const input = document.getElementById('new-task-input');
  const button = document.getElementById('add-task-btn');

  button.addEventListener('click', () => {
    const newTaskText = input.value.trim();
    if (newTaskText === '') return;

    chrome.storage.local.get(['tasks'], (result) => {
      const tasks = result.tasks || [];
      tasks.push({ text: newTaskText, completed: false });

      chrome.storage.local.set({ tasks }, () => {
        input.value = ''; // Clear input field after adding task
        loadAndDisplayTasks(); // Refresh the list
      });
    });
  });

  input.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      button.click(); // Trigger button click when pressing Enter
    }
  });
}

function setupTaskActions() {
  document.querySelectorAll('.task-item').forEach(task => {
    task.addEventListener('click', (event) => {
      const index = parseInt(event.target.dataset.index, 10);

      chrome.storage.local.get(['tasks'], (result) => {
        let tasks = result.tasks || [];
        tasks[index].completed = !tasks[index].completed; // Toggle completion status

        chrome.storage.local.set({ tasks }, () => {
          loadAndDisplayTasks(); // Refresh the list after toggling
        });
      });
    });
  });

  document.querySelectorAll('.delete-task-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      const index = parseInt(event.target.dataset.index, 10);
      
      chrome.storage.local.get(['tasks'], (result) => {
        let tasks = result.tasks || [];
        tasks.splice(index, 1); // Remove task at the specified index

        chrome.storage.local.set({ tasks }, () => {
          loadAndDisplayTasks(); // Refresh the list after deletion
        });
      });
    });
  });
}

// Function to create the popup modal with overlay
function showTodoPopup() {
  chrome.storage.local.get(['tasks'], (result) => {
    const tasks = result.tasks || [];
    const taskList = tasks.length > 0 
      ? tasks.map(task => `<div style="padding: 4px 0; ${task.completed ? 'text-decoration: line-through; color: #666' : ''}">${task.text}</div>`).join('')
      : '<div style="color: #666">Congrats! No work pending.</div>';
    
    // Create overlay to disable background interactions
    const overlay = document.createElement('div');
    overlay.id = 'todo-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent background
    overlay.style.zIndex = '9998';

    // Create popup modal
    const popup = document.createElement('div');
    popup.id = 'todo-popup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = 'black';
    popup.style.padding = '20px 40px';
    popup.style.boxShadow = '0px 0px 15px var(--chrome-ui)';
    popup.style.zIndex = '9999';
    popup.style.borderRadius = '20px';
    popup.style.textAlign = 'center';
    popup.style.width = '35%';
    popup.style.fontFamily = 'Arial, sans-serif';

    popup.innerHTML = `
      <div style="color: var(--chrome-fg); font-family: var(--font-family);">
          <h2 style="margin-bottom: 10px;">You have work pending dawg</h2>
          <div style="max-height: 200px; overflow-y: auto; text-align: left; padding: 10px;">
          ${taskList}
          </div>
          <button id="continue-btn" style="margin-top: 10px; padding: 8px 16px; background: var(--chrome-ui); color: var(--chrome-ui-fg); border: none; cursor: pointer; border-radius: 40px;">Continue</button>
      </div>
    `;

    // Append overlay and popup to the body
    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    // Disable background interactions
    // document.body.style.pointerEvents = 'none';

    // Event listener for "Continue" button
    document.getElementById('continue-btn').addEventListener('click', () => {
      popup.remove();
      overlay.remove();
      // document.body.style.pointerEvents = 'auto'; // Restore interactions
    });
  });
}

// Show the popup when user first visits tumblr.com
if (!sessionStorage.getItem('todoPopupShown')) {
  showTodoPopup();
  sessionStorage.setItem('todoPopupShown', 'true');
}

// Show the popup every 15 minutes
setInterval(showTodoPopup, 15 * 60 * 1000);

// Listen for storage changes and update the UI
chrome.storage.onChanged.addListener(loadAndDisplayTasks);

// Start the replacement process
replaceTrendingWithTodo();