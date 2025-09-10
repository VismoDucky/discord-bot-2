const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Only certain roles can use timeout
const ALLOWED_ROLES = [
  "1413790022536138824", // owner
  "1413790735970598942", //Coowner
  "1413879100812034189", // Admin
  "1413794316350132236" // Mod
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Put a member in timeout for a set duration')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The member to timeout')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('minutes')
        .setDescription('Duration of the timeout in minutes (max 10080 = 7 days)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the timeout')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id);
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    // Check role restriction
    const hasRole = interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id));
    if (!hasRole) {
      return interaction.reply({ content: '🚫 You don’t have permission to use this command.', ephemeral: true });
    }

    // Check valid duration
    if (minutes < 1 || minutes > 10080) {
      return interaction.reply({ content: '❌ Timeout must be between **1 minute** and **7 days**.', ephemeral: true });
    }

    try {
      const ms = minutes * 60 * 1000;
      await member.timeout(ms, reason);

      await interaction.reply(`⏳ ${user.tag} has been timed out for **${minutes} minutes**. Reason: ${reason}`);
      
      // Try to DM the user
      try {
        await user.send(`⏳ You have been put in timeout in **${interaction.guild.name}** for ${minutes} minutes.\nReason: ${reason}`);
      } catch {
        console.log(`Couldn’t DM ${user.tag} about their timeout.`);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: `❌ Failed to timeout ${user.tag}.`, ephemeral: true });
    }
  },
};
