const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Replace with role IDs that can use /slowmode
const ALLOWED_ROLES = [
  "1413794316350132236",
  "1413879100812034189",
  "1413790735970598942",
  "1413790022536138824"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode for the current channel')
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Slowmode duration in seconds (0 to disable)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    // Check role restriction
    const hasRole = interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id));
    if (!hasRole) {
      return interaction.reply({ content: '🚫 You don’t have permission to use this command.', ephemeral: true });
    }

    const seconds = interaction.options.getInteger('seconds');

    if (seconds < 0 || seconds > 21600) { // 6 hours max per Discord limit
      return interaction.reply({ content: '❌ Slowmode must be between **0** and **21600** seconds.', ephemeral: true });
    }

    try {
      await interaction.channel.setRateLimitPerUser(seconds, `Set by ${interaction.user.tag}`);
      if (seconds === 0) {
        await interaction.reply(`✅ Slowmode has been **disabled** in ${interaction.channel}.`);
      } else {
        await interaction.reply(`✅ Slowmode set to **${seconds} seconds** in ${interaction.channel}.`);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Failed to set slowmode.', ephemeral: true });
    }
  },
};

