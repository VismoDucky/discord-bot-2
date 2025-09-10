const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Get a random inspirational quote'),

  async execute(interaction) {
    try {
      // Use native fetch
      const response = await fetch('https://zenquotes.io/api/random');
      const data = await response.json();
      const quote = data[0].q;
      const author = data[0].a;

      await interaction.reply(`💬 "${quote}" - **${author}**`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Could not fetch a quote right now.', ephemeral: true });
    }
  },
};
