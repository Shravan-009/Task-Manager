var todoList = [];
var comdoList = [];
var remList = [];

var addButton = document.getElementById("add-button");
var todoInput = document.getElementById("todo-input");
var deleteAllButton = document.getElementById("delete-all");
var allTodos = document.getElementById("all-todos");
var deleteSButton = document.getElementById("delete-selected");

// Fetch tasks on initial load
document.addEventListener("DOMContentLoaded", fetchTodos);

//event listners for add and delete
addButton.addEventListener("click", add);
deleteAllButton.addEventListener("click", deleteAll);
deleteSButton.addEventListener("click", deleteS);

//event listeners for filters
document.addEventListener('click', (e) => {
    const deleteButton = e.target.closest('.delete');
    const completeButton = e.target.closest('.complete');

    if (completeButton) {
        completeTodo(completeButton.closest('li'));
    }
    if (deleteButton) {
        deleteTodo(deleteButton.closest('li'));
    }
    if (e.target.id == "all") {
        viewAll();
    }
    if (e.target.id == "rem") {
        viewRemaining();
    }
    if (e.target.id == "com") {
        viewCompleted();
    }
});

//event listner for enter key
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        add();
    }
});

// Fetch from API
async function fetchTodos() {
    try {
        const response = await fetch('/api/todos');
        todoList = await response.json();
        update();
        addinmain(todoList);
    } catch (err) {
        console.error("Error fetching tasks", err);
    }
}

//updates the all the remaining, completed and main list
function update() {
    comdoList = todoList.filter((ele) => {
        return ele.complete;
    });
    remList = todoList.filter((ele) => {
        return !ele.complete;
    });
    document.getElementById("r-count").innerText = remList.length.toString(); // fixed logic to show remaining length
    document.getElementById("c-count").innerText = comdoList.length.toString();
}

//adds the task in main list
async function add() {
    var value = todoInput.value;
    if (value === '') {
        alert("😮 Task cannot be empty");
        return;
    }
    
    try {
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: value })
        });
        const newTask = await response.json();
        todoList.push(newTask);
        
        todoInput.value = "";
        update();
        addinmain(todoList);
    } catch (err) {
        console.error("Error adding task", err);
    }
}

//renders the main list and views on the main content
function addinmain(list) {
    allTodos.innerHTML = "";
    list.forEach(element => {
        var x = `<li id=${element._id} class="todo-item">
    <p id="task" class="${element.complete ? 'line' : ''}"> ${element.complete ? `<strike>${element.task}</strike>` : element.task} </p>
    <div class="todo-actions">
                <button class="complete btn btn-success">
                    <i class=" ci bx bx-check bx-sm"></i>
                </button>

                <button class="delete btn btn-error" >
                    <i class="di bx bx-trash bx-sm"></i>
                </button>
            </div>
        </li>`;
        allTodos.innerHTML += x;
    });
}

//deletes and indiviual task and update all the list
async function deleteTodo(todoItem) {
    if (!todoItem) return;
    var deleted = todoItem.getAttribute('id');
    try {
        await fetch(`/api/todos/${deleted}`, { method: 'DELETE' });
        todoList = todoList.filter((ele) => {
            return ele._id != deleted;
        });
        update();
        addinmain(todoList);
    } catch(err) {
        console.error("Error deleting task", err);
    }
}

//completes indiviaula task and updates all the list
async function completeTodo(todoItem) {
    if (!todoItem) return;
    var completed = todoItem.getAttribute('id');
    try {
        const response = await fetch(`/api/todos/${completed}`, { method: 'PUT' });
        const updatedTask = await response.json();
        
        todoList.forEach((obj) => {
            if (obj._id == completed) {
                obj.complete = updatedTask.complete;
            }
        });

        update();
        viewAll(); // always view all when toggling to avoid disappearing issues or rely on current view
    } catch(err) {
        console.error("Error toggling complete", err);
    }
}

//deletes all the tasks
async function deleteAll(todo) {
    try {
        await fetch('/api/todos', { method: 'DELETE' });
        todoList = [];
        update();
        addinmain(todoList);
    } catch(err) {
        console.error("Error deleting all", err);
    }
}

//deletes only completed task
async function deleteS(todo) {
    try {
        await fetch('/api/todos/delete-completed', { method: 'POST' });
        todoList = todoList.filter((ele) => {
            return !ele.complete;
        });
        update();
        addinmain(todoList);
    } catch(err) {
        console.error("Error deleting completed tasks", err);
    }
}

// functions for filters
function viewCompleted() {
    addinmain(comdoList);
}

function viewRemaining() {
    addinmain(remList);
}

function viewAll() {
    addinmain(todoList);
}