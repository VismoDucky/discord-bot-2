const { SlashCommandBuilder } = require('discord.js');

const responses = [
  "Yes ✅",
  "No ❌",
  "Maybe 🤔",
  "Definitely 🔥",
  "Ask again later ⏳",
  "100% yes 👌",
  "Not looking good chief 💀",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8 ball a question')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your question')
        .setRequired(true)),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const answer = responses[Math.floor(Math.random() * responses.length)];
    await interaction.reply(`🎱 You asked: *${question}*\nAnswer: **${answer}**`);
  },
};
