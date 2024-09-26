// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId"));

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
}

// Todo: create a function to generate a unique task id
function generateTaskId() {
    return nextId++; // might not be perfect, but at least itll work... for... 583712897 years if you made a task every microsecond
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    const taskClass = getTaskStatusClass(task); // Html is the second worst thing in webdev behind css
    return `
      <div class="card task-card mb-2 ${taskClass}" data-id="${task.id}">
        <div class="card-body">
          <h5 class="card-title">${task.title}</h5>
          <hr>
          <p class="card-text">${task.description}</p>
          <p class="card-text"><small>Due: ${task.dueDate}</small></p>
          <button class="btn btn-danger btn-sm delete-btn">Delete</button>
        </div>
      </div>
    `;
}

// sub function for createTaskCard (above) just to make it look cleaner
function getTaskStatusClass(task) {
    const now = dayjs();
    const dueDate = dayjs(task.dueDate);

    if (dueDate.isBefore(now, 'day')) {
        return 'bg-danger';
    } else if (dueDate.isSame(now, 'day')) {
        return 'bg-warning';
    } else {
        return 'bg-white';
    }
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    $('#todo-cards').empty();
    $('#in-progress-cards').empty();
    $('#done-cards').empty();

    // Just directly added to line 2
    //   if (!taskList) {
    //     taskList = []
    //   }

    taskList.forEach(task => {
        const taskCard = createTaskCard(task);
        if (task.status === 'to-do') {
            $('#todo-cards').append(taskCard);
        } else if (task.status === 'in-progress') {
            $('#in-progress-cards').append(taskCard);
        } else {
            $('#done-cards').append(taskCard);
        }
    });

    // Make the cards draggable
    $(".task-card").draggable({
        revert: "invalid",
        stack: ".task-card"
    });

    // Add delete button functionality
    $('.delete-btn').click(handleDeleteTask);
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    const title = $('#task-title').val();
    const description = $('#task-desc').val();
    const dueDate = $('#task-due').val();

    if (!title || !dueDate || !description) {
        alert('Fill everything out!!!');
        return;
    }

    const newTask = {
        id: generateTaskId(),
        title,
        description,
        dueDate,
        status: 'to-do'
    };

    taskList.push(newTask);
    saveTasks();
    renderTaskList();

    $('#task-form')[0].reset(); // Clear out the task form!
    $('#formModal').modal('hide'); // Destroy the task modal! (make it hide)
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(event.target).closest('.task-card').data('id');
    taskList = taskList.filter(task => task.id !== taskId);
    saveTasks();
    renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable.data('id');

    const targetId = $(event.target).closest('.card').attr('id');
    if (!targetId) {
        console.error('Invalid drop target');
        return;
    }

    const newStatus = targetId.replace('-cards', '');

    const task = taskList.find(e => e.id === taskId); // arrow functions my beloved
    task.status = newStatus;

    saveTasks();
    renderTaskList();
}


// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $('#add-task-btn').click(handleAddTask);

    // "make lanes droppable"
    $('.card-body').droppable({
        accept: ".task-card",
        drop: handleDrop
    });

    // "make the due date field a date picker"
    $('#task-due').datepicker({
        dateFormat: 'mm-dd-yy'
    });
});
