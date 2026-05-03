import "dotenv/config";
import express from "express";
import { login, resolveNick, reactToMessage } from "./bot.js";
import { sendEmbed } from "./embed.js";

const app = express();
app.use(express.json());

const log = (tag, msg) =>
  console.log(`[${new Date().toISOString()}] [${tag}] ${msg}`);

app.use((req, res, next) => {
  log("HTTP", `${req.method} ${req.path} — IP: ${req.ip}`);
  next();
});

app.get("/", (req, res) => {
  log("GET /", "health check");
  res.send("Bot encaminhador online.");
});

app.post("/form-submit", async (req, res) => {
  log("FORM", "request recebido");
  log("FORM", `body: ${JSON.stringify(req.body)}`);

  const { descricao, link, nick } = req.body;

  if (!descricao || !link) {
    log("FORM", `campos faltando — descricao: ${!!descricao}, link: ${!!link}`);
    return res.status(400).json({ error: "descricao e link são obrigatórios" });
  }

  log("FORM", `descricao: "${descricao}"`);
  log("FORM", `link: "${link}"`);
  log("FORM", `nick: "${nick || "Anônimo"}"`);

  log("BOT", `buscando membro com nick "${nick}" no servidor...`);
  const userId = await resolveNick(nick);

  if (userId) {
    log("BOT", `membro encontrado — ID: ${userId}`);
  } else {
    log("BOT", `membro não encontrado — usando nick como texto`);
  }

  const submittedBy = userId ? `<@${userId}>` : (nick || "Anônimo");

  log("WEBHOOK", "enviando mensagem...");

  try {
    const { messageId, channelId } = await sendEmbed(descricao, link, submittedBy);
    log("WEBHOOK", "mensagem enviada com sucesso");

    await reactToMessage(channelId, messageId);
    log("BOT", `reagiu com ⭐ na mensagem ${messageId}`);
  } catch (err) {
    log("WEBHOOK", `erro ao enviar: ${err.message}`);
    return res.status(500).json({ error: "falha ao enviar para o Discord" });
  }

  res.sendStatus(200);
});

login().then(() => {
  log("BOT", `bot online — ${process.env.BOT_ID}`);
  app.listen(3000, () => log("SERVER", "servidor rodando na porta 3000"));
});
