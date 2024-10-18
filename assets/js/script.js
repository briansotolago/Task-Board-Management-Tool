// Retrieve the task list and next ID from localStorage or set defaults
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Function to generate a unique task ID
function generateTaskId() {
  if (nextId) {
    nextId += 1; // Increment the nextId
  } else {
    nextId = 1; // Start with 1 if nextId is not already set
  }
  localStorage.setItem('nextId', JSON.stringify(nextId));
  return nextId;
}

// Function to create a task card element
function createTaskCard(task) {
  const taskCard = $('<div>')
    .addClass('card task-card draggable my-3')
    .attr('data-taskid', task.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.title);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.description);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-taskid', task.id);
  cardDeleteBtn.on('click', handleDeleteTask);

  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

  // Change the color to green if the task status is 'done'
  if (task.status === 'done') {
    taskCard.addClass('bg-success text-white');
  }

  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
}

// Function to render the task list in the appropriate swim lanes
function renderTaskList() {
  const todoList = $('#todo-cards');
  todoList.empty();

  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();

  const doneList = $('#done-cards');
  doneList.empty();

  for (let task of taskList) {
    if (task.status === 'to-do') {
      todoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
    }
  }

  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const taskTitle = $('#title').val().trim();
  const taskDueDate = $('#due-date').val();
  const taskDescription = $('#description').val();

  const newTask = {
    id: generateTaskId(),
    title: taskTitle,
    dueDate: taskDueDate,
    description: taskDescription,
    status: 'to-do',
  };
  taskList.push(newTask);
  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();

  // Clear form fields after adding the task
  $('#title').val('');
  $('#due-date').val('');
  $('#description').val('');
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).attr('data-taskid');
  taskList = taskList.filter(task => task.id !== parseInt(taskId));
  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// Function to handle dropping a task into a new swim lane
function handleDrop(event, ui) {
  const taskId = ui.draggable[0].dataset.taskid;
  const newStatus = event.target.id;

  for (let task of taskList) {
    if (task.id === parseInt(taskId)) {
      task.status = newStatus;

      // Change the card color to green if the task is moved to 'Done'
      if (newStatus === 'done') {
        $(ui.draggable).css("background-color", "#28a745").css("color", "#ffffff");
      } else {
        // Reset the color if the task is moved to other columns
        $(ui.draggable).css("background-color", "").css("color", "");
      }
    }
  }

  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// jQuery document ready function to initialize the page
$(document).ready(function () {
  renderTaskList();

  // Initialize the date picker for the due date input field
  $('#due-date').datepicker({
    changeMonth: true,
    changeYear: true,
  });

  // Bind the form submission event to handle adding a task
  $('#task-form').on('submit', handleAddTask);

  // Set up droppable areas for the swim lanes
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });
});
