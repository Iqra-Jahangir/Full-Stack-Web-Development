console.log("script.js linked successfully"); // Warm-up 1

const addBtn = document.getElementById("addBtn");
console.log(addBtn);

addBtn.addEventListener("click", () => {
  console.log("clicked");
});

const taskList = document.getElementById("taskList");
const demoLi = document.createElement("li");
demoLi.textContent = "Demo task (warm-up test)";
taskList.appendChild(demoLi);
taskList.removeChild(demoLi);


const taskInput = document.getElementById("taskInput");
const errorMsg = document.getElementById("errorMsg");
const taskCount = document.getElementById("taskCount");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

function updateTaskCount() {
  const items = taskList.querySelectorAll("li");
  if (items.length === 0) {
    taskCount.textContent = "No tasks yet.";
  } else {
    const completedCount = taskList.querySelectorAll("li.completed").length;
    taskCount.textContent = `${items.length} task(s) total, ${completedCount} completed`;
  }
}

function addTask() {
  const text = taskInput.value.trim();

  if (text === "") {
    errorMsg.textContent = "Please enter a task before adding.";
    return;
  }
  errorMsg.textContent = "";

  const li = document.createElement("li");

  const span = document.createElement("span");
  span.classList.add("taskText");
  span.textContent = text;

  const delBtn = document.createElement("button");
  delBtn.classList.add("deleteBtn");
  delBtn.textContent = "Delete";

  li.appendChild(span);
  li.appendChild(delBtn);
  taskList.appendChild(li);

  taskInput.value = "";
  updateTaskCount();
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

taskList.addEventListener("click", (e) => {
  if (e.target.classList.contains("deleteBtn")) {
    e.target.closest("li").remove();
    updateTaskCount();
    return; 
  }

  const li = e.target.closest("li");
  if (li) {
    li.classList.toggle("completed");
    updateTaskCount();
  }
});

clearCompletedBtn.addEventListener("click", () => {
  const completedItems = taskList.querySelectorAll("li.completed");
  completedItems.forEach((item) => item.remove());
  updateTaskCount();
});
