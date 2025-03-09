function replaceCarouselTitle() {
  const observer = new MutationObserver(() => {
    const carouselTitle = document.querySelector('.HphhS');
    if (carouselTitle && !document.getElementById('carousel-title')) {
      // Get the current UTC time
      const now = new Date();

      const estTimeString = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(now);

      const cetTimeString = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Paris",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(now);

      const aestTimeString = new Intl.DateTimeFormat("en-US", {
        timeZone: "Australia/Sydney",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(now);

      carouselTitle.innerHTML = `
        <div id="carousel-title" style="color: var(--chrome-fg);">
          ${estTimeString} EST • ${cetTimeString} CET • ${aestTimeString} AEST
        </div>
      `;
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function replaceCarouselContent() {
  const observer = new MutationObserver(() => {
    const carouselSection = document.querySelector('.q1ZAL');
    if (carouselSection && !document.getElementById('carousel-container')) {
      carouselSection.innerHTML = `
        <div style="position: relative; width: 100%;">
          <button id="scroll-left" class="TRX6J" aria-label="Scroll carousel left" 
            style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); z-index: 10;">
            <svg height="40" role="presentation" width="40" xmlns="http://www.w3.org/2000/svg" 
              style="transform: rotate(90deg); transform-origin: center center;">
              <use href="#managed-icon__caret-thin"></use>
            </svg>
          </button>

          <section id="carousel-container" 
            style="margin: 0 auto; overflow-x: auto; overflow-y: hidden; white-space: nowrap; display: flex; gap: 20px; scroll-behavior: smooth;">
            <div style="flex-shrink: 0; width: 540px;">
              <iframe width="540" height="200" src="https://spells.neocities.org/moons/"></iframe>
            </div>
            <div style="flex-shrink: 0; width: 540px;">
              <iframe width="540" height="200" src="https://spells.neocities.org/astrology/"></iframe>
            </div>
            <div style="flex-shrink: 0; width: 540px;">
              <iframe width="540" height="200" src="https://spells.neocities.org/sabbats/"></iframe>
            </div>
          </section>

          <button id="scroll-right" class="TRX6J" aria-label="Scroll carousel right" 
            style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); z-index: 10;">
            <svg height="40" role="presentation" width="40" xmlns="http://www.w3.org/2000/svg" 
              style="transform: rotate(270deg); transform-origin: center center;">
              <use href="#managed-icon__caret-thin"></use>
            </svg>
          </button>
        </div>
      `;

      setupCarouselScroll();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function setupCarouselScroll() {
  const container = document.getElementById("carousel-container");
  const scrollLeftBtn = document.getElementById("scroll-left");
  const scrollRightBtn = document.getElementById("scroll-right");

  function smoothScroll(amount) {
    container.scrollBy({ left: amount, behavior: "smooth" });
  }

  function updateButtons() {
    scrollLeftBtn.style.display = container.scrollLeft > 0 ? "block" : "none";
    scrollRightBtn.style.display = 
      container.scrollLeft + container.clientWidth < container.scrollWidth ? "block" : "none";
  }

  scrollLeftBtn.addEventListener("click", () => {
    smoothScroll(-560);
    setTimeout(updateButtons, 500);
  });

  scrollRightBtn.addEventListener("click", () => {
    smoothScroll(560);
    setTimeout(updateButtons, 500);
  });

  container.addEventListener("scroll", updateButtons);
  updateButtons(); // Initial check
}


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

// Listen for storage changes and update the UI
chrome.storage.onChanged.addListener(loadAndDisplayTasks);

// Start the replacement process
replaceTrendingWithTodo();
replaceCarouselTitle();
replaceCarouselContent();