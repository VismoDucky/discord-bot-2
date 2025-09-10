const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Replace this with the role IDs allowed to use /kick
const ALLOWED_ROLES = [
  "1413790735970598942", // coowner
  "1413790022536138824"  // owner
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The member to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    // Check roles first
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
      // DM the user before kicking
      await user.send(`👢 You have been **kicked** from **${interaction.guild.name}**.\nReason: ${reason}`);
    } catch {
      // ignore if DMs are closed
    }

    try {
      await member.kick(reason);
      await interaction.reply(`✅ ${user.tag} has been kicked. Reason: ${reason}`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: `❌ Could not kick ${user.tag}.`, ephemeral: true });
    }
  },
};
