const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Replace with IDs of roles that can use /ban
const ALLOWED_ROLES = [
  "1413790735970598942", // co owner
  "1413790022536138824"  // owner
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The member to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    // Check if user has allowed role
    const hasRole = interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id));
    if (!hasRole) {
      return interaction.reply({ content: '🚫 You don’t have permission to use this command.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!member) {
      return interaction.reply({ content: `❌ Could not find that member in the server.`, ephemeral: true });
    }

    try {
      await user.send(`⛔ You have been **banned** from **${interaction.guild.name}**.\nReason: ${reason}`);
    } catch {
      // ignore if DMs are closed
    }

    try {
      await member.ban({ reason });
      await interaction.reply(`✅ ${user.tag} has been banned. Reason: ${reason}`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: `❌ Could not ban ${user.tag}.`, ephemeral: true });
    }
  },
};
