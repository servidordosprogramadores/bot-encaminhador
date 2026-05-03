const WEBHOOK_URL = process.env.WEBHOOK_URL + "?with_components=true&wait=true";

export async function sendEmbed(descricao, link, nick) {
  const payload = {
    components: [
      {
        type: 17,
        accent_color: 7424185,
        spoiler: false,
        components: [
          { type: 10, content: "# Novo projeto recebido" },
          { type: 10, content: `**Descrição**: ${descricao}` },
          { type: 10, content: `**Link**: ${link}` },
          { type: 10, content: `> _**Submetido por**_: ${nick}` },
          {
            type: 10,
            content:
              "-# Se curtiu esse projeto, reaja a esta mensagem com uma estrela (⭐).",
          },
        ],
      },
    ],
    flags: 32768,
  };

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord API: ${res.status} — ${text}`);
  }

  const message = await res.json();
  return { messageId: message.id, channelId: message.channel_id };
}
