// Global Variables
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let filter = 'all';
let sort = 'priority';
let timerInterval;
let timeLeft = 25 * 60; // 25 minutes in seconds
let taskChart;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
  renderTasks();
  renderChart();
  updateClock();
  setInterval(updateClock, 1000);
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('taskDue').value = today;
});

// Task Management Functions
function addTask() {
  const name = document.getElementById('taskName').value.trim();
  const dueDate = document.getElementById('taskDue').value;
  const priority = document.getElementById('taskPriority').value;
  const category = document.getElementById('taskCategory').value;
  
  if (!name || !dueDate) {
    showNotification('Please fill in all fields', 'error');
    return;
  }
  
  const newTask = {
    id: Date.now(),
    name,
    dueDate,
    priority,
    category,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  saveAndRender();
  
  // Clear form
  document.getElementById('taskName').value = '';
  document.getElementById('taskDue').value = new Date().toISOString().split('T')[0];
  
  showNotification('Task added successfully!', 'success');
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    
    saveAndRender();
    
    // Check if all tasks are completed
    checkAllTasksCompleted();
    
    showNotification(
      task.completed ? 'Task completed! 🎉' : 'Task marked as pending',
      task.completed ? 'success' : 'info'
    );
  }
}

function deleteTask(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
    showNotification('Task deleted', 'info');
  }
}

function checkAllTasksCompleted() {
  const incompleteTasks = tasks.filter(t => !t.completed);
  if (tasks.length > 0 && incompleteTasks.length === 0) {
    // All tasks completed - trigger celebration!
    setTimeout(() => {
      confetti.celebrate();
    }, 500);
  }
}

// Filtering and Sorting
function setFilter(value) {
  filter = value;
  
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-filter="${value}"]`).classList.add('active');
  
  renderTasks();
}

function setSort(value) {
  sort = value;
  renderTasks();
}

function getFilteredTasks() {
  let filtered = [...tasks];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  switch (filter) {
    case 'today':
      filtered = filtered.filter(t => {
        const taskDate = new Date(t.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });
      break;
    case 'this-week':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(t => {
        const taskDate = new Date(t.dueDate);
        return taskDate >= startOfWeek && taskDate <= endOfWeek;
      });
      break;
    case 'overdue':
      filtered = filtered.filter(t => {
        const taskDate = new Date(t.dueDate);
        taskDate.setHours(23, 59, 59, 999);
        return taskDate < today && !t.completed;
      });
      break;
  }
  
  // Sort tasks
  switch (sort) {
    case 'priority':
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      break;
    case 'due-date':
      filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      break;
    case 'category':
      filtered.sort((a, b) => a.category.localeCompare(b.category));
      break;
  }
  
  return filtered;
}

// Rendering Functions
function renderTasks() {
  const container = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const filtered = getFilteredTasks();
  
  // Clear container
  container.innerHTML = '';
  
  if (filtered.length === 0) {
    container.appendChild(emptyState);
    return;
  }
  
  filtered.forEach(task => {
    const taskElement = createTaskElement(task);
    container.appendChild(taskElement);
  });
}

function createTaskElement(task) {
  const div = document.createElement('div');
  div.className = `task-item ${task.priority.toLowerCase()}-priority ${task.completed ? 'completed' : ''}`;
  
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  const isOverdue = dueDate < today && !task.completed;
  
  div.innerHTML = `
    <div class="task-content">
      <div class="task-name">${escapeHtml(task.name)}</div>
      <div class="task-meta">
        <span class="task-category">${task.category}</span>
        <span class="task-priority ${task.priority.toLowerCase()}">
          ${getPriorityIcon(task.priority)} ${task.priority}
        </span>
        <span class="task-date ${isOverdue ? 'overdue' : ''}">
          📅 ${formatDate(task.dueDate)}
          ${isOverdue ? ' (Overdue)' : ''}
        </span>
      </div>
    </div>
    <div class="task-actions">
      <button class="complete" onclick="toggleComplete(${task.id})" title="${task.completed ? 'Mark as pending' : 'Mark as complete'}">
        ${task.completed ? '↩️' : '✅'}
      </button>
      <button class="delete" onclick="deleteTask(${task.id})" title="Delete task">
        🗑️
      </button>
    </div>
  `;
  
  return div;
}

function getPriorityIcon(priority) {
  switch (priority) {
    case 'High': return '🔴';
    case 'Medium': return '🟡';
    case 'Low': return '🟢';
    default: return '⚪';
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderChart() {
  const ctx = document.getElementById('taskChart').getContext('2d');
  const completed = tasks.filter(t => t.completed).length;
  const overdue = tasks.filter(t => {
    const taskDate = new Date(t.dueDate);
    const today = new Date();
    return taskDate < today && !t.completed;
  }).length;
  const pending = tasks.length - completed - overdue;
  
  // Update stats
  document.getElementById('pendingCount').textContent = pending;
  document.getElementById('overdueCount').textContent = overdue;
  document.getElementById('completedCount').textContent = completed;
  
  // Destroy existing chart
  if (taskChart) {
    taskChart.destroy();
  }
  
  taskChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'Overdue', 'Completed'],
      datasets: [{
        data: [pending, overdue, completed],
        backgroundColor: [
          '#f39c12',
          '#e74c3c',
          '#27ae60'
        ],
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBorderWidth: 5,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12,
              weight: '500'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#ffffff',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true
        }
      },
      cutout: '60%',
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1000
      }
    }
  });
}

// Storage Functions
function saveAndRender() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
  renderChart();
}

// Pomodoro Timer Functions
function startPomodoro() {
  const startBtn = document.getElementById('startBtn');
  
  if (timerInterval) {
    // Pause timer
    clearInterval(timerInterval);
    timerInterval = null;
    startBtn.innerHTML = '▶️ Start';
    startBtn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
    return;
  }
  
  // Start timer
  startBtn.innerHTML = '⏸️ Pause';
  startBtn.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
  
  timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      startBtn.innerHTML = '▶️ Start';
      startBtn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
      
      // Pomodoro completed
      showNotification('🍅 Pomodoro session completed!', 'success');
      confetti.burst(30);
      
      // Reset timer
      timeLeft = 25 * 60;
      updateTimerDisplay();
      return;
    }
    
    timeLeft--;
    updateTimerDisplay();
  }, 1000);
}

function resetPomodoro() {
  clearInterval(timerInterval);
  timerInterval = null;
  timeLeft = 25 * 60;
  updateTimerDisplay();
  
  const startBtn = document.getElementById('startBtn');
  startBtn.innerHTML = '▶️ Start';
  startBtn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  document.getElementById('timer').textContent = `${minutes}:${seconds}`;
}

// Dark Mode Functions
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  
  document.getElementById('themeToggle').textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  
  // Save preference
  localStorage.setItem('darkMode', isDark);
}

// Clock Functions
function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  document.getElementById('clock').textContent = '🕒 ' + timeStr;
}

// Notification System
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 10px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 300px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  `;
  
  // Type-specific colors
  switch (type) {
    case 'success':
      notification.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
      break;
    case 'error':
      notification.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
      break;
    case 'info':
    default:
      notification.style.background = 'linear-gradient(45deg, #3498db, #2980b9)';
      break;
  }
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Animate out and remove
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Initialize dark mode from localStorage
document.addEventListener('DOMContentLoaded', function() {
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode === 'true') {
    document.body.classList.add('dark-mode');
    document.getElementById('themeToggle').textContent = '☀️ Light Mode';
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Ctrl/Cmd + Enter to add task
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const taskName = document.getElementById('taskName');
    if (document.activeElement === taskName && taskName.value.trim()) {
      addTask();
    }
  }
  
  // Escape to clear task input
  if (e.key === 'Escape') {
    document.getElementById('taskName').value = '';
    document.getElementById('taskName').blur();
  }
});