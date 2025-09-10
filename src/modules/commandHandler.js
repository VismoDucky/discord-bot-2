const { Client } = require('discord.js');
const logger = require('../utils/logger');
const roleModule = require('./roleModule');
const securityModule = require('./securityModule');

class CommandHandler {
  constructor(client) {
    this.client = client;
  }

  async handleCommand(message) {
    if (!message.content.startsWith('!') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
      switch (command) {
        case 'warn':
          await this.warnUser(message);
          break;
        case 'kick':
          await this.kickUser(message);
          break;
        case 'ban':
          await this.banUser(message);
          break;
        case 'addrole':
          await roleModule.addRole(message);
          break;
        case 'requestrole':
          await roleModule.requestRole(message);
          break;
        case 'approverole':
          await roleModule.approveRole(message);
          break;
        case 'denyrole':
          await roleModule.denyRole(message);
          break;
        default:
          message.reply('Unknown command. Use !help for a list of commands.');
      }
    } catch (error) {
      logger.error(`Command error: ${error.message}`);
      message.reply('An error occurred while processing the command.');
    }
  }

  async warnUser(message) {
    if (!message.member.permissions.has('MODERATE_MEMBERS')) {
      return message.reply('You do not have permission to warn users.');
    }
    const user = message.mentions.users.first();
    const reason = message.content.split(' ').slice(2).join(' ') || 'No reason provided';

    if (!user) return message.reply('Please mention a user to warn.');

    await securityModule.warnUser(message.guild, user, message.author, reason);
    message.reply(`${user} has been warned.`);
  }

  async kickUser(message) {
    if (!message.member.permissions.has('KICK_MEMBERS')) {
      return message.reply('You do not have permission to kick users.');
    }
    const user = message.mentions.users.first();
    const reason = message.content.split(' ').slice(2).join(' ') || 'No reason provided';

    if (!user) return message.reply('Please mention a user to kick.');

    await securityModule.kickUser(message.guild, user, message.author, reason);
  }

  async banUser(message) {
    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return message.reply('You do not have permission to ban users.');
    }
    const user = message.mentions.users.first();
    const reason = message.content.split(' ').slice(2).join(' ') || 'No reason provided';

    if (!user) return message.reply('Please mention a user to ban.');

    await securityModule.banUser(message.guild, user, message.author, reason);
  }
}

module.exports = CommandHandler;