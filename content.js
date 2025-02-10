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

// // Reload tasks when storage changes
// chrome.storage.onChanged.addListener(loadAndDisplayTasks);

// // Keep replacing the trending section on navigation
// replaceTrendingWithTodo();


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

// Listen for storage changes
chrome.storage.onChanged.addListener(loadAndDisplayTasks);

// Start the replacement process
replaceTrendingWithTodo();