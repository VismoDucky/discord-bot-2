const { SlashCommandBuilder } = require('discord.js');

const memes = [
  "https://i.imgur.com/W3duR07.png",
  "https://i.imgur.com/2ZbF4Zy.jpg",
  "https://i.imgur.com/j8Y8Gdt.jpeg",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme'),
  async execute(interaction) {
    const meme = memes[Math.floor(Math.random() * memes.length)];
    await interaction.reply({ content: meme });
  },
};
