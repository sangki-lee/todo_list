export async function onRequestGet({ env }) {
  const { results } = await env.DB
    .prepare("SELECT id, title, detail, due_date, completed, created_at FROM todos ORDER BY due_date ASC, created_at ASC")
    .all();
  return Response.json(results);
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  const title = body?.title?.trim();

  if (!title) {
    return Response.json({ error: "할 일을 입력해주세요." }, { status: 400 });
  }

  const detail = body?.detail?.trim() ?? "";
  const dueDate = body?.due_date || new Date().toISOString().slice(0, 10);

  const result = await env.DB
    .prepare(
      "INSERT INTO todos (title, detail, due_date) VALUES (?, ?, ?) RETURNING id, title, detail, due_date, completed, created_at"
    )
    .bind(title, detail, dueDate)
    .first();

  return Response.json(result, { status: 201 });
}
