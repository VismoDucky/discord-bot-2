const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

class SecurityModule {
  constructor(client) {
    this.client = client;
    this.recentActions = new Map();
  }

  initializeAntiNukingProtection() {
    this.client.on('guildMemberRemove', async (member) => {
      this.trackMemberRemoval(member);
    });

    this.client.on('guildBanAdd', async (ban) => {
      this.trackBanAction(ban);
    });
  }

  async trackMemberRemoval(member) {
    const guildId = member.guild.id;
    const currentTime = Date.now();

    if (!this.recentActions.has(guildId)) {
      this.recentActions.set(guildId, []);
    }

    const actions = this.recentActions.get(guildId);
    actions.push({ type: 'removal', timestamp: currentTime });

    // Remove actions older than 5 minutes
    const filteredActions = actions.filter(
      action => currentTime - action.timestamp < 5 * 60 * 1000
    );

    if (filteredActions.length > 10) {
      await this.handlePotentialNuking(member.guild);
    }

    this.recentActions.set(guildId, filteredActions);
  }

  async handlePotentialNuking(guild) {
    try {
      const auditLogs = await guild.fetchAuditLogs({ limit: 10 });
      const suspiciousUser = auditLogs.entries.first().executor;

      logger.warn(`Potential nuking detected by user: ${suspiciousUser.tag}`);

      // Additional protection measures
      await guild.members.ban(suspiciousUser, {
        reason: 'Potential server nuking attempt'
      });
    } catch (error) {
      logger.error('Error handling potential nuking', error);
    }
  }
}

module.exports = SecurityModule;
