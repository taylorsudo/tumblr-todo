function replaceTrendingWithTodo() {
  const observer = new MutationObserver((mutations) => {
    const trendingSection = document.querySelector('div[aria-label="Trending"]');
    if (trendingSection && !document.getElementById('todo-content')) {
      trendingSection.innerHTML = `
        <div style="padding: 12px;">
          <h2 style="font-size: 1.25rem; margin-bottom: 12px;">Your Todo List</h2>
          <div id="todo-content"></div>
        </div>
      `;
      loadAndDisplayTasks();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function loadAndDisplayTasks() {
  chrome.storage.local.get(['tasks'], (result) => {
    const tasks = result.tasks || [];
    const container = document.getElementById('todo-content');
    container.innerHTML = tasks.length > 0 
      ? tasks.map(task => `
          <div style="padding: 4px 0; ${task.completed ? 'text-decoration: line-through; color: #666' : ''}">
            ${task.text}
          </div>
        `).join('')
      : '<div style="color: #666">No tasks yet - add some using the extension icon!</div>';
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
    popup.style.padding = '20px';
    popup.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
    popup.style.zIndex = '9999';
    popup.style.borderRadius = '10px';
    popup.style.textAlign = 'center';

    popup.innerHTML = `
      <h2 style="margin-bottom: 10px;">Your Todo List</h2>
      <div style="max-height: 200px; overflow-y: auto; text-align: left; padding: 10px; border: 1px solid #ccc;">
        ${taskList}
      </div>
      <button id="continue-btn" style="margin-top: 10px; padding: 5px 10px; background: #1DA1F2; color: white; border: none; cursor: pointer; border-radius: 5px;">Continue</button>
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

// Show the popup when user first visits x.com
if (!sessionStorage.getItem('todoPopupShown')) {
  showTodoPopup();
  sessionStorage.setItem('todoPopupShown', 'true');
}

// Show the popup every 15 minutes
setInterval(showTodoPopup, 15 * 60 * 1000);

// Listen for storage changes
chrome.storage.onChanged.addListener(loadAndDisplayTasks);

// Start the replacement process
replaceTrendingWithTodo();
