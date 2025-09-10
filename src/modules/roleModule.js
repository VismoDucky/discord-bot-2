const logger = require('../utils/logger');

class RoleModule {
  constructor(client) {
    this.client = client;
    this.pendingRoleRequests = new Map();
  }

  async addRole(message) {
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      return message.reply('You do not have permission to add roles.');
    }

    const user = message.mentions.users.first();
    const roleName = message.content.split(' ').slice(2).join(' ');

    if (!user || !roleName) {
      return message.reply('Please specify a user and a role name.');
    }

    try {
      const role = message.guild.roles.cache.find(r => r.name === roleName);
      if (!role) return message.reply(`Role "${roleName}" not found.`);

      const member = await message.guild.members.fetch(user.id);
      await member.roles.add(role);

      message.reply(`Added role "${roleName}" to ${user}.`);
      logger.info(`Role added: ${roleName} to ${user.tag}`);
    } catch (error) {
      logger.error(`Role add error: ${error.message}`);
      message.reply('Could not add the role.');
    }
  }

  async requestRole(message) {
    const roleName = message.content.split(' ').slice(1).join(' ');

    if (!roleName) {
      return message.reply('Please specify a role name.');
    }

    const role = message.guild.roles.cache.find(r => r.name === roleName);
    if (!role) return message.reply(`Role "${roleName}" not found.`);

    this.pendingRoleRequests.set(message.author.id, {
      roleName: roleName,
      timestamp: Date.now()
    });

    message.reply(`Role request for "${roleName}" submitted. Waiting for approval.`);
  }

  async approveRole(message) {
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      return message.reply('You do not have permission to approve roles.');
    }

    const user = message.mentions.users.first();
    const roleName = message.content.split(' ').slice(2).join(' ');

    if (!user || !roleName) {
      return message.reply('Please specify a user and a role name.');
    }

    const request = this.pendingRoleRequests.get(user.id);
    if (!request || request.roleName !== roleName) {
      return message.reply('No pending role request found for this user and role.');
    }

    try {
      const role = message.guild.roles.cache.find(r => r.name === roleName);
      if (!role) return message.reply(`Role "${roleName}" not found.`);

      const member = await message.guild.members.fetch(user.id);
      await member.roles.add(role);

      this.pendingRoleRequests.delete(user.id);
      message.reply(`Approved role "${roleName}" for ${user}.`);
      user.send(`Your role request for "${roleName}" has been approved.`);
    } catch (error) {
      logger.error(`Role approval error: ${error.message}`);
      message.reply('Could not approve the role.');
    }
  }

  async denyRole(message) {
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      return message.reply('You do not have permission to deny roles.');
    }

    const user = message.mentions.users.first();
    const roleName = message.content.split(' ').slice(2).join(' ');

    if (!user || !roleName) {
      return message.reply('Please specify a user and a role name.');
    }

    const request = this.pendingRoleRequests.get(user.id);
    if (!request || request.roleName !== roleName) {
      return message.reply('No pending role request found for this user and role.');
    }

    this.pendingRoleRequests.delete(user.id);
    message.reply(`Denied role "${roleName}" for ${user}.`);
    user.send(`Your role request for "${roleName}" has been denied.`);
  }
}

module.exports = new RoleModule();