// Selectors
const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const filterButtons = document.querySelectorAll(".filters button");
const itemsLeft = document.querySelector("#items-left");
const clearCompletedBtn = document.querySelector("#clear-completed");
const themeToggleBtn = document.querySelector("#theme-toggle");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

/* Theme */
(function initTheme() {
  const saved = localStorage.getItem("theme") || "light";
  document.body.classList.toggle("dark", saved === "dark");
})();
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const nowDark = !document.body.classList.contains("dark");
    document.body.classList.toggle("dark", nowDark);
    localStorage.setItem("theme", nowDark ? "dark" : "light");
  });
}

/* Render */
function renderTodos() {
  todoList.innerHTML = "";

  const filtered = todos.filter((t) =>
    currentFilter === "active"
      ? !t.completed
      : currentFilter === "completed"
      ? t.completed
      : true
  );

  filtered.forEach((todo) => {
    const origIndex = todos.indexOf(todo); // map to index in source array

    const li = document.createElement("li");
    if (todo.completed) li.classList.add("completed");

    li.innerHTML = `
      <input type="checkbox" class="toggle" data-index="${origIndex}" ${
      todo.completed ? "checked" : ""
    }>
      <span class="text" data-index="${origIndex}">${todo.text}</span>
      <button class="delete" data-index="${origIndex}">✖</button>
    `;
    todoList.appendChild(li);
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  itemsLeft.textContent = `${activeCount}`;

  localStorage.setItem("todos", JSON.stringify(todos));
}

/* Add */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({ text, completed: false });
  input.value = "";
  renderTodos();
});

/* Toggle, delete, edit */
todoList.addEventListener("click", (e) => {
  const index = Number(e.target.dataset.index);
  if (e.target.classList.contains("toggle")) {
    todos[index].completed = e.target.checked;
    renderTodos();
  } else if (e.target.classList.contains("delete")) {
    todos.splice(index, 1);
    renderTodos();
  }
});

// Inline edit on double click
todoList.addEventListener("dblclick", (e) => {
  if (!e.target.classList.contains("text")) return;

  const span = e.target;
  const index = Number(span.dataset.index);
  const li = span.closest("li");
  if (!li) return;

  li.classList.add("editing");
  const inputEdit = document.createElement("input");
  inputEdit.type = "text";
  inputEdit.value = todos[index].text;
  inputEdit.className = "edit-input";

  span.replaceWith(inputEdit);
  inputEdit.focus();
  inputEdit.setSelectionRange(inputEdit.value.length, inputEdit.value.length);

  const commit = () => {
    const newText = inputEdit.value.trim();
    if (newText) todos[index].text = newText;
    li.classList.remove("editing");
    renderTodos();
  };
  const cancel = () => {
    li.classList.remove("editing");
    renderTodos();
  };

  inputEdit.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") commit();
    if (ev.key === "Escape") cancel();
  });
  inputEdit.addEventListener("blur", commit);
});

/* Filters */
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

/* Clear completed */
clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter((t) => !t.completed);
  renderTodos();
});

/* Init */
renderTodos();
