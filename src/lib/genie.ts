// Server-side client for the Databricks Genie Conversations API.
// Asks a natural-language question against the reading lakehouse
// (workspace.reading) and returns the answer, the SQL Genie wrote,
// and the query result rows.

export type GenieAnswer = {
  answer: string | null;
  sql: string | null;
  description: string | null;
  columns: string[];
  rows: string[][];
};

const POLL_INTERVAL_MS = 2000;
const POLL_BUDGET_MS = 45000;
const MAX_ROWS = 50;

function creds(): { host: string; token: string; space: string } {
  const host = process.env.DATABRICKS_HOST;
  const token = process.env.DATABRICKS_TOKEN;
  const space = process.env.DATABRICKS_GENIE_SPACE_ID;
  if (!host || !token || !space) {
    throw new Error(
      "Databricks not configured. Set DATABRICKS_HOST, DATABRICKS_TOKEN, DATABRICKS_GENIE_SPACE_ID.",
    );
  }
  return { host: host.replace(/\/$/, ""), token, space };
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const { host, token } = creds();
  const res = await fetch(host + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Databricks ${res.status}: ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

type Attachment = {
  attachment_id?: string;
  text?: { content?: string };
  query?: { query?: string; description?: string };
};

type Message = { status?: string; attachments?: Attachment[] };

export async function askGenie(question: string): Promise<GenieAnswer> {
  const { space } = creds();

  const start = await api<{ conversation_id: string; message_id: string }>(
    `/api/2.0/genie/spaces/${space}/start-conversation`,
    { method: "POST", body: JSON.stringify({ content: question }) },
  );

  const msgPath = `/api/2.0/genie/spaces/${space}/conversations/${start.conversation_id}/messages/${start.message_id}`;

  const deadline = Date.now() + POLL_BUDGET_MS;
  let message: Message = {};
  for (;;) {
    message = await api<Message>(msgPath);
    const status = message.status ?? "";
    if (status === "COMPLETED") break;
    if (["FAILED", "CANCELLED", "QUERY_RESULT_EXPIRED"].includes(status)) {
      throw new Error(`Genie could not answer (status ${status}).`);
    }
    if (Date.now() > deadline) {
      throw new Error("Genie timed out. Try a simpler question.");
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  const out: GenieAnswer = {
    answer: null,
    sql: null,
    description: null,
    columns: [],
    rows: [],
  };

  for (const att of message.attachments ?? []) {
    if (att.text?.content) out.answer = att.text.content;
    if (att.query?.query && att.attachment_id) {
      out.sql = att.query.query;
      out.description = att.query.description ?? null;
      const result = await api<{
        statement_response?: {
          manifest?: { schema?: { columns?: { name: string }[] } };
          result?: { data_array?: string[][] };
        };
      }>(`${msgPath}/attachments/${att.attachment_id}/query-result`);
      const sr = result.statement_response;
      out.columns = (sr?.manifest?.schema?.columns ?? []).map((c) => c.name);
      out.rows = (sr?.result?.data_array ?? []).slice(0, MAX_ROWS);
    }
  }

  if (!out.answer && !out.sql) {
    throw new Error("Genie returned no answer for that question.");
  }
  return out;
}
