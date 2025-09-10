const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Only certain roles can use untimeout
const ALLOWED_ROLES = [
  "1413790022536138824", // owner
  "1413790735970598942", //Coowner
  "1413879100812034189", // Admin
  "1413794316350132236" // Mod
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Remove a timeout from a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The member to untimeout')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for removing the timeout')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    // Check role restriction
    const hasRole = interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id));
    if (!hasRole) {
      return interaction.reply({ content: '🚫 You don’t have permission to use this command.', ephemeral: true });
    }

    try {
      await member.timeout(null, reason); // null removes timeout

      await interaction.reply(`✅ Timeout removed from ${user.tag}. Reason: ${reason}`);

      // Try to DM the user
      try {
        await user.send(`✅ Your timeout in **${interaction.guild.name}** has been lifted.\nReason: ${reason}`);
      } catch {
        console.log(`Couldn’t DM ${user.tag} about their untimeout.`);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: `❌ Failed to untimeout ${user.tag}.`, ephemeral: true });
    }
  },
};
