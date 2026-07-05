export async function onRequestGet({ env }) {
  const { results } = await env.DB
    .prepare("SELECT id, title, detail, created_at FROM todos ORDER BY created_at DESC, id DESC")
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

  const result = await env.DB
    .prepare("INSERT INTO todos (title, detail) VALUES (?, ?) RETURNING id, title, detail, created_at")
    .bind(title, detail)
    .first();

  return Response.json(result, { status: 201 });
}
