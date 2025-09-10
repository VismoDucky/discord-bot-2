const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const ALLOWED_ROLES = [
  "1413790022536138824", // owner
  "1413790735970598942", //Coowner
  "1413879100812034189", // Admin
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Lock or unlock the entire server')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Choose whether to lock or unlock the server')
        .setRequired(true)
        .addChoices(
          { name: 'lock', value: 'lock' },
          { name: 'unlock', value: 'unlock' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const action = interaction.options.getString('action');

    // role restriction check
    const hasRole = interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id));
    if (!hasRole) {
      return interaction.reply({ content: '🚫 You don’t have permission to use this command.', ephemeral: true });
    }

    try {
      const channels = interaction.guild.channels.cache.filter(ch => ch.isTextBased());

      for (const channel of channels.values()) {
        const perms = channel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id);

        if (action === 'lock') {
          await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
        } else if (action === 'unlock') {
          // Restore default (allow messages unless otherwise restricted)
          await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
        }
      }

      if (action === 'lock') {
        await interaction.reply('🔒 Server is now **LOCKED**. Members cannot send messages.');
      } else {
        await interaction.reply('🔓 Server is now **UNLOCKED**. Members can send messages again.');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Failed to update lockdown status.', ephemeral: true });
    }
  },
};
