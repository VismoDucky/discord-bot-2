const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Open a support ticket'),

  async execute(interaction) {
    const guild = interaction.guild;
    const user = interaction.user;

    // === CONFIGURE THESE ===
    const TICKET_CATEGORY_ID = '1413875049600909485';
    const STAFF_ROLE_ID = '1413875039308087437';
    // =======================

    // Generate clean ticket name
    let baseName = `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    let ticketName = baseName;
    let counter = 1;
    while (guild.channels.cache.some(c => c.name === ticketName)) {
      ticketName = `${baseName}-${counter}`;
      counter++;
    }

    // Create ticket channel
    const ticketChannel = await guild.channels.create({
      name: ticketName,
      type: ChannelType.GuildText,
      parent: TICKET_CATEGORY_ID,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        { id: STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
      ]
    });

    // Send welcome message + close button
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger)
    );

    await ticketChannel.send({
      content: `🎫 Hello ${user}, a staff member will be with you shortly!`,
      components: [row]
    });

    await interaction.reply({ content: `✅ Your ticket has been created: ${ticketChannel}`, ephemeral: true });

    // Button collector
    const filter = i => i.customId === 'close_ticket' && (i.user.id === user.id || i.member.roles.cache.has(STAFF_ROLE_ID));
    const collector = ticketChannel.createMessageComponentCollector({ filter, time: 0 });

    collector.on('collect', async i => {
      if (i.customId === 'close_ticket') {
        await i.reply({ content: '🔒 Closing ticket...', ephemeral: true });

        // Fetch all messages for transcript
        const messages = await ticketChannel.messages.fetch({ limit: 100 });
        const sorted = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        let transcript = '';
        sorted.forEach(msg => {
          transcript += `[${new Date(msg.createdTimestamp).toLocaleString()}] ${msg.author.tag}: ${msg.content}\n`;
        });

        // DM the transcript to the ticket creator
        try {
          await user.send('📄 Here is the transcript of your ticket:\n```' + transcript.slice(0, 2000) + '```');
        } catch (err) {
          console.error(`Could not DM user ${user.tag}`);
        }

        // DM the transcript to all staff members with the STAFF_ROLE_ID
        const staffRole = guild.roles.cache.get(STAFF_ROLE_ID);
        if (staffRole) {
          staffRole.members.forEach(async staff => {
            try {
              await staff.send(`📄 Ticket closed by ${i.user.tag}:\n` + '```' + transcript.slice(0, 2000) + '```');
            } catch (err) {
              console.error(`Could not DM staff member ${staff.user.tag}`);
            }
          });
        }

        // Delete ticket channel after 5 seconds
        setTimeout(() => ticketChannel.delete().catch(console.error), 5000);
      }
    });
  }
};
