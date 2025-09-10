const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Replace with the role IDs allowed to use /unban
const ALLOWED_ROLES = [
  "1413790735970598942", // coowner
  "1413790022536138824"  // owner
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('The ID of the user to unban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the unban')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    // Check if the executor has the right role
    const hasRole = interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id));
    if (!hasRole) {
      return interaction.reply({ content: '🚫 You don’t have permission to use this command.', ephemeral: true });
    }

    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await interaction.guild.bans.remove(userId, reason);
      await interaction.reply(`✅ Successfully unbanned <@${userId}>. Reason: ${reason}`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: `❌ Could not unban user with ID \`${userId}\`.`, ephemeral: true });
    }
  },
};
