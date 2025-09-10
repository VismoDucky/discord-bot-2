const { Events } = require('discord.js');

const PROTECTED_USER_ID = "764602617283870730"; // your Discord ID

const PROTECTIVE_LINES = [
  "HEY!! 😡 Don’t be mean to my mom!!",
  "Stop it right now or I’ll tell the teacher!!! 😤",
  "You’re just jealous because my mom is the best!! 😎",
  "Leave them alone or I’m not sharing my toys with you!! 🧸",
  "Nuh-uh!! You’re mean!! 😭",
  "Don’t talk to my mom like that!! >:(",
  "Back off, or I’ll tell my dad!! 👊",
  "DAD!! Someone’s being mean to mom!! 😠",
];

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    // Only trigger if YOU call Olympus
    if (
      message.author.id === PROTECTED_USER_ID &&
      message.mentions.has(message.client.user)
    ) {
      // Find the other people you mentioned besides Olympus
      const mentionedUsers = message.mentions.users.filter(
        user => user.id !== message.client.user.id
      );

      if (mentionedUsers.size > 0) {
        const target = mentionedUsers.first(); // grab the first person you tagged
        const randomLine = PROTECTIVE_LINES[Math.floor(Math.random() * PROTECTIVE_LINES.length)];
        await message.channel.send(`${target} ${randomLine}`);
      }
    }
  },
};
