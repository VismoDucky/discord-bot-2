const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { loadEvents } = require("./modules/eventHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔹 Load events
loadEvents(client);

// 🔹 Store commands
client.commands = new Collection();
const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(__dirname, 'commands', file));
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[WARNING] The command at ${file} is missing "data" or "execute".`);
  }
}

// 🔹 Deploy commands to ONE guild (instant updates)
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );

    console.log('✅ Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// 🔹 Presence
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    status: "online",
    activities: [{ name: "Watching over berd...", type: 3 }] // 3 = WATCHING
  });
});

// 🔹 Olympus Personality Module
const OlympusPersonality = require('./modules/olympusPersonality');
const momId = '764602617283870730'; 
const dadId = '1316071566580383811'; 
OlympusPersonality(client, momId, dadId);

// 🚨 RAID DETECTION
const joinTimestamps = [];
const RAID_JOIN_LIMIT = 5;
const RAID_TIME_WINDOW = 30000; // 30s
const RAID_ACTION = "kick";     // or "ban"
const LOG_CHANNEL_NAME = "logs";

client.on('guildMemberAdd', async (member) => {
  const now = Date.now();
  joinTimestamps.push(now);

  while (joinTimestamps.length && joinTimestamps[0] < now - RAID_TIME_WINDOW) {
    joinTimestamps.shift();
  }

  if (joinTimestamps.length >= RAID_JOIN_LIMIT) {
    try {
      const logChannel = member.guild.channels.cache.find(
        ch => ch.name === LOG_CHANNEL_NAME
      );

      if (logChannel) {
        await logChannel.send(
          `🚨 **Raid detected!** ${joinTimestamps.length} joins in 30s.\nTaking action: **${RAID_ACTION.toUpperCase()}**`
        );
      }

      const members = await member.guild.members.fetch();
      const newMembers = members.filter(m => Date.now() - m.joinedTimestamp < RAID_TIME_WINDOW);

      for (const m of newMembers.values()) {
        if (RAID_ACTION === "kick") {
          await m.kick("Raid protection");
        } else if (RAID_ACTION === "ban") {
          await m.ban({ reason: "Raid protection" });
        }
      }

      joinTimestamps.length = 0;
    } catch (err) {
      console.error("Raid handler error:", err);
    }
  }
});

// 🔹 Slash command handling
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command found for ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: '❌ Error executing command!', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ Error executing command!', ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
