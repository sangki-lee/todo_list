const listEl = document.getElementById("todo-list");
const emptyEl = document.getElementById("empty-state");
const formEl = document.getElementById("todo-form");
const inputEl = document.getElementById("todo-input");
const templateEl = document.getElementById("todo-item-template");

async function fetchTodos() {
  const res = await fetch("/api/todos");
  if (!res.ok) throw new Error("할 일을 불러오지 못했습니다.");
  return res.json();
}

async function createTodo(title) {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("할 일을 추가하지 못했습니다.");
  return res.json();
}

async function updateTodo(id, title, detail) {
  const res = await fetch(`/api/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, detail }),
  });
  if (!res.ok) throw new Error("할 일을 수정하지 못했습니다.");
  return res.json();
}

async function deleteTodo(id) {
  const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("할 일을 삭제하지 못했습니다.");
}

function renderTodos(todos) {
  listEl.innerHTML = "";
  emptyEl.classList.toggle("hidden", todos.length > 0);
  emptyEl.classList.toggle("flex", todos.length === 0);

  for (const todo of todos) {
    const node = templateEl.content.firstElementChild.cloneNode(true);
    node.dataset.id = todo.id;
    node.querySelector(".todo-title").textContent = todo.title;

    const detailEl = node.querySelector(".todo-detail");
    detailEl.textContent = todo.detail || "";
    detailEl.classList.toggle("hidden", !todo.detail);

    listEl.appendChild(node);
  }
}

async function loadTodos() {
  const todos = await fetchTodos();
  renderTodos(todos);
}

function enterEditMode(itemEl, todo) {
  itemEl.querySelector(".view-mode").classList.add("hidden");
  const editMode = itemEl.querySelector(".edit-mode");
  editMode.classList.remove("hidden");
  editMode.classList.add("flex");

  const titleInput = itemEl.querySelector(".edit-title-input");
  const detailInput = itemEl.querySelector(".edit-detail-input");
  titleInput.value = todo.title;
  detailInput.value = todo.detail || "";
  titleInput.focus();
}

function exitEditMode(itemEl) {
  itemEl.querySelector(".view-mode").classList.remove("hidden");
  const editMode = itemEl.querySelector(".edit-mode");
  editMode.classList.add("hidden");
  editMode.classList.remove("flex");
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = inputEl.value.trim();
  if (!title) return;

  formEl.querySelector("button").disabled = true;
  try {
    await createTodo(title);
    inputEl.value = "";
    await loadTodos();
  } catch (err) {
    alert(err.message);
  } finally {
    formEl.querySelector("button").disabled = false;
    inputEl.focus();
  }
});

listEl.addEventListener("click", async (e) => {
  const itemEl = e.target.closest(".todo-item");
  if (!itemEl) return;
  const id = itemEl.dataset.id;

  if (e.target.matches(".edit-btn")) {
    const todo = {
      title: itemEl.querySelector(".todo-title").textContent,
      detail: itemEl.querySelector(".todo-detail").textContent,
    };
    enterEditMode(itemEl, todo);
    return;
  }

  if (e.target.matches(".cancel-btn")) {
    exitEditMode(itemEl);
    return;
  }

  if (e.target.matches(".save-btn")) {
    const title = itemEl.querySelector(".edit-title-input").value.trim();
    const detail = itemEl.querySelector(".edit-detail-input").value.trim();
    if (!title) {
      alert("할 일을 입력해주세요.");
      return;
    }
    try {
      await updateTodo(id, title, detail);
      await loadTodos();
    } catch (err) {
      alert(err.message);
    }
    return;
  }

  if (e.target.matches(".delete-btn")) {
    if (!confirm("이 할 일을 삭제할까요?")) return;
    try {
      await deleteTodo(id);
      await loadTodos();
    } catch (err) {
      alert(err.message);
    }
  }
});

loadTodos().catch((err) => {
  emptyEl.textContent = err.message;
  emptyEl.classList.remove("hidden");
  emptyEl.classList.add("flex");
});
