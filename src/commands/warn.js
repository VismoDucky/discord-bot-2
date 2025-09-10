const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Replace with IDs of roles that can use /warn
const ALLOWED_ROLES = [
  "1413790735970598942", // co owner
  "1413790022536138824"  // owner
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member via DM')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The member to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // usually mods+ get warn perms
  async execute(interaction) {
    // Check if user has allowed role
    const hasRole = interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id));
    if (!hasRole) {
      return interaction.reply({ content: '🚫 You don’t have permission to use this command.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await user.send(`⚠️ You have been warned in **${interaction.guild.name}**.\nReason: ${reason}`);
      await interaction.reply(`✅ ${user.tag} has been warned. Reason: ${reason}`);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `❌ Could not send a DM to ${user.tag}.`,
        ephemeral: true
      });
    }
  },
};

