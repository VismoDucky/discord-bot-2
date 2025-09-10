const { EmbedBuilder } = require('discord.js');

class RoleManagement {
  constructor(client) {
    this.client = client;
    this.pendingRoleRequests = new Map();
  }

  async warnUser(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    // Implement warning logic
    await interaction.reply(`Warned ${user.tag} for: ${reason}`);
  }

  async kickUser(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await interaction.guild.members.kick(user, reason);
      await interaction.reply(`Kicked ${user.tag} from the server`);
    } catch (error) {
      await interaction.reply('Unable to kick the user');
    }
  }

  async banUser(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await interaction.guild.members.ban(user, { reason });
      await interaction.reply(`Banned ${user.tag} from the server`);
    } catch (error) {
      await interaction.reply('Unable to ban the user');
    }
  }

  async addRole(interaction) {
    const role = interaction.options.getRole('role');
    const user = interaction.options.getUser('user');

    // Implement role addition with approval for sensitive roles
    if (this.isHighPrivilegeRole(role)) {
      await this.requestRoleApproval(interaction, user, role);
    } else {
      await this.assignRoleDirectly(interaction, user, role);
    }
  }

  isHighPrivilegeRole(role) {
    const highPrivilegeRoles = ['Admin', 'Moderator', 'Manager'];
    return highPrivilegeRoles.includes(role.name);
  }

  async requestRoleApproval(interaction, user, role) {
    const approvers = interaction.guild.roles.cache
      .find(r => r.name === 'Role Approvers')
      .members;

    const request = {
      user: user,
      role: role,
      requestedBy: interaction.user
    };

    const requestId = Date.now().toString();
    this.pendingRoleRequests.set(requestId, request);

    const embed = new EmbedBuilder()
      .setTitle('Role Request')
      .setDescription(`${interaction.user.tag} wants to add ${role.name} to ${user.tag}`);

    for (const approver of approvers) {
      await approver.send({
        embeds: [embed],
        components: [
          {
            type: 1,
            components: [
              { type: 2, label: 'Approve', style: 3, custom_id: `approve_${requestId}` },
              { type: 2, label: 'Deny', style: 4, custom_id: `deny_${requestId}` }
            ]
          }
        ]
      });
    }

    await interaction.reply('Role request sent for approval');
  }

  async handleRoleRequest(interaction) {
    const requestId = interaction.customId.split('_')[1];
    const request = this.pendingRoleRequests.get(requestId);

    if (!request) return;

    if (interaction.customId.startsWith('approve')) {
      await this.assignRoleDirectly(interaction, request.user, request.role);
      await interaction.update({ content: 'Role request approved', components: [] });
    } else {
      await interaction.update({ content: 'Role request denied', components: [] });
    }

    this.pendingRoleRequests.delete(requestId);
  }

  async assignRoleDirectly(interaction, user, role) {
    try {
      const member = await interaction.guild.members.fetch(user.id);
      await member.roles.add(role);
      await interaction.reply(`Added ${role.name} to ${user.tag}`);
    } catch (error) {
      await interaction.reply('Unable to add role');
    }
  }
}

module.exports = RoleManagement;
