export async function onRequestPut({ request, env, params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const title = body?.title?.trim();

  if (!title) {
    return Response.json({ error: "할 일을 입력해주세요." }, { status: 400 });
  }

  const detail = body?.detail?.trim() ?? "";

  const result = await env.DB
    .prepare("UPDATE todos SET title = ?, detail = ? WHERE id = ? RETURNING id, title, detail, created_at")
    .bind(title, detail, id)
    .first();

  if (!result) {
    return Response.json({ error: "할 일을 찾을 수 없습니다." }, { status: 404 });
  }

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
