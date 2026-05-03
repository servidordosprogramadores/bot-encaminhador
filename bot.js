import { Client, GatewayIntentBits, ActivityType } from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

export async function login() {
  await client.login(process.env.BOT_TOKEN);
  await new Promise((resolve) =>
    client.once("ready", () => {
      client.user.setPresence({
        activities: [{ name: "📝 Projetos da comunidade", type: ActivityType.Watching }],
        status: "online",
      });
      resolve();
    })
  );
}

export async function reactToMessage(channelId, messageId) {
  const channel = await client.channels.fetch(channelId);
  const message = await channel.messages.fetch(messageId);
  await message.react("⭐");
}

export async function resolveNick(nick) {
  if (!nick) return null;

  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const results = await guild.members.search({ query: nick, limit: 10 });

  const member = results.find(
    (m) =>
      m.user.username.toLowerCase() === nick.toLowerCase() ||
      (m.nickname && m.nickname.toLowerCase() === nick.toLowerCase()) ||
      m.displayName.toLowerCase() === nick.toLowerCase()
  );

  return member ? member.user.id : null;
}
