export async function onRequestPut({ request, env, params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const current = await env.DB
    .prepare("SELECT id, title, detail, due_date, completed FROM todos WHERE id = ?")
    .bind(id)
    .first();

  if (!current) {
    return Response.json({ error: "할 일을 찾을 수 없습니다." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const title = body.title !== undefined ? body.title.trim() : current.title;
  if (!title) {
    return Response.json({ error: "할 일을 입력해주세요." }, { status: 400 });
  }

  const detail = body.detail !== undefined ? body.detail.trim() : current.detail;
  const dueDate = body.due_date !== undefined ? body.due_date : current.due_date;
  const completed = body.completed !== undefined ? (body.completed ? 1 : 0) : current.completed;

  const result = await env.DB
    .prepare(
      "UPDATE todos SET title = ?, detail = ?, due_date = ?, completed = ? WHERE id = ? RETURNING id, title, detail, due_date, completed, created_at"
    )
    .bind(title, detail, dueDate, completed, id)
    .first();

  return Response.json(result);
}

export async function onRequestDelete({ env, params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  await env.DB.prepare("DELETE FROM todos WHERE id = ?").bind(id).run();
  return new Response(null, { status: 204 });
}
