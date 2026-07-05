const listEl = document.getElementById("todo-list");
const emptyEl = document.getElementById("empty-state");
const formEl = document.getElementById("todo-form");
const inputEl = document.getElementById("todo-input");
const dateInputEl = document.getElementById("todo-date");
const templateEl = document.getElementById("todo-item-template");

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchTodos() {
  const res = await fetch("/api/todos");
  if (!res.ok) throw new Error("할 일을 불러오지 못했습니다.");
  return res.json();
}

async function createTodo(title, dueDate) {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, due_date: dueDate }),
  });
  if (!res.ok) throw new Error("할 일을 추가하지 못했습니다.");
  return res.json();
}

async function patchTodo(id, patch) {
  const res = await fetch(`/api/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("할 일을 수정하지 못했습니다.");
  return res.json();
}

async function deleteTodo(id) {
  const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("할 일을 삭제하지 못했습니다.");
}

function groupByDate(todos) {
  const map = new Map();
  for (const todo of todos) {
    const key = todo.due_date;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(todo);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function formatDateLabel(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${y}년 ${m}월 ${d}일 (${WEEKDAYS[date.getDay()]})`;
}

function buildTodoNode(todo) {
  const node = templateEl.content.firstElementChild.cloneNode(true);
  node.dataset.id = todo.id;
  node.dataset.completed = todo.completed ? "1" : "0";
  node.dataset.dueDate = todo.due_date;

  const titleEl = node.querySelector(".todo-title");
  titleEl.textContent = todo.title;
  titleEl.classList.toggle("line-through", !!todo.completed);
  titleEl.classList.toggle("text-gray-400", !!todo.completed);

  const detailEl = node.querySelector(".todo-detail");
  detailEl.textContent = todo.detail || "";
  detailEl.classList.toggle("hidden", !todo.detail);
  detailEl.classList.toggle("line-through", !!todo.completed);

  const completeBtn = node.querySelector(".complete-btn");
  completeBtn.textContent = todo.completed ? "완료 취소" : "완료";
  completeBtn.classList.toggle("bg-[#3182F6]", !!todo.completed);
  completeBtn.classList.toggle("text-white", !!todo.completed);
  completeBtn.classList.toggle("bg-gray-100", !todo.completed);
  completeBtn.classList.toggle("text-gray-600", !todo.completed);

  return node;
}

function renderTodos(todos) {
  listEl.innerHTML = "";
  emptyEl.classList.toggle("hidden", todos.length > 0);
  emptyEl.classList.toggle("flex", todos.length === 0);

  for (const [date, items] of groupByDate(todos)) {
    const section = document.createElement("div");
    section.className = "mb-6 last:mb-0";

    const header = document.createElement("div");
    header.className = "flex items-center justify-between mb-2 px-1";

    const label = document.createElement("h2");
    label.className = "text-[13px] font-semibold text-gray-400";
    label.textContent = formatDateLabel(date);
    header.appendChild(label);

    const deleteDateBtn = document.createElement("button");
    deleteDateBtn.className = "delete-date-btn text-[12px] text-gray-400 hover:text-red-500 font-medium transition";
    deleteDateBtn.textContent = "삭제";
    deleteDateBtn.dataset.date = date;
    header.appendChild(deleteDateBtn);

    section.appendChild(header);

    const itemsWrap = document.createElement("div");
    itemsWrap.className = "space-y-2.5";
    for (const todo of items) {
      itemsWrap.appendChild(buildTodoNode(todo));
    }
    section.appendChild(itemsWrap);

    listEl.appendChild(section);
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

  itemEl.querySelector(".edit-title-input").value = todo.title;
  itemEl.querySelector(".edit-detail-input").value = todo.detail || "";
  itemEl.querySelector(".edit-date-input").value = todo.dueDate;
  itemEl.querySelector(".edit-title-input").focus();
}

function exitEditMode(itemEl) {
  itemEl.querySelector(".view-mode").classList.remove("hidden");
  const editMode = itemEl.querySelector(".edit-mode");
  editMode.classList.add("hidden");
  editMode.classList.remove("flex");
}

dateInputEl.value = todayString();

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = inputEl.value.trim();
  if (!title) return;

  formEl.querySelector("button").disabled = true;
  try {
    await createTodo(title, dateInputEl.value || todayString());
    inputEl.value = "";
    inputEl.focus();
    await loadTodos();
  } catch (err) {
    alert(err.message);
  } finally {
    formEl.querySelector("button").disabled = false;
  }
});

listEl.addEventListener("click", async (e) => {
  if (e.target.matches(".delete-date-btn")) {
    const date = e.target.dataset.date;
    if (!confirm(`${formatDateLabel(date)}의 할 일을 모두 삭제할까요?`)) return;
    try {
      const todos = await fetchTodos();
      const ids = todos.filter((t) => t.due_date === date).map((t) => t.id);
      await Promise.all(ids.map((id) => deleteTodo(id)));
      await loadTodos();
    } catch (err) {
      alert(err.message);
    }
    return;
  }

  const itemEl = e.target.closest(".todo-item");
  if (!itemEl) return;
  const id = itemEl.dataset.id;

  if (e.target.matches(".complete-btn")) {
    const completed = itemEl.dataset.completed === "1";
    try {
      await patchTodo(id, { completed: !completed });
      await loadTodos();
    } catch (err) {
      alert(err.message);
    }
    return;
  }

  if (e.target.matches(".edit-btn")) {
    enterEditMode(itemEl, {
      title: itemEl.querySelector(".todo-title").textContent,
      detail: itemEl.querySelector(".todo-detail").textContent,
      dueDate: itemEl.dataset.dueDate,
    });
    return;
  }

  if (e.target.matches(".cancel-btn")) {
    exitEditMode(itemEl);
    return;
  }

  if (e.target.matches(".save-btn")) {
    const title = itemEl.querySelector(".edit-title-input").value.trim();
    const detail = itemEl.querySelector(".edit-detail-input").value.trim();
    const dueDate = itemEl.querySelector(".edit-date-input").value;
    if (!title) {
      alert("할 일을 입력해주세요.");
      return;
    }
    if (!dueDate) {
      alert("날짜를 선택해주세요.");
      return;
    }
    try {
      await patchTodo(id, { title, detail, due_date: dueDate });
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
