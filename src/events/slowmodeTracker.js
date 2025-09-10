const RATE_LIMIT_WINDOW = 30 * 1000; // 30 seconds
const MESSAGE_THRESHOLD_HIGH = 12;// trigger slowmode
const MESSAGE_THRESHOLD_LOW = 5; // remove slowmode
const SLOWMODE_SECONDS = 10; // slowmode duration when active

const messageCounts = new Map(); // channelId => [{timestamp}, ...]

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const now = Date.now();
    const channelId = message.channel.id;

    if (!messageCounts.has(channelId)) messageCounts.set(channelId, []);
    const timestamps = messageCounts.get(channelId);

    // add new message
    timestamps.push(now);

    // remove old messages outside the window
    while (timestamps.length && now - timestamps[0] > RATE_LIMIT_WINDOW) {
      timestamps.shift();
    }

    // check activity
    try {
      if (timestamps.length >= MESSAGE_THRESHOLD_HIGH && message.channel.rateLimitPerUser === 0) {
        // enable slowmode
        await message.channel.setRateLimitPerUser(SLOWMODE_SECONDS, 'High activity detected');
        console.log(`Enabled slowmode in ${message.channel.name}`);

        // 🎉 New addition: occasional warning message
        if (Math.random() < 0.3) {
          await message.channel.send("Whoa, everyone slow down 😳");
        }
      } else if (timestamps.length <= MESSAGE_THRESHOLD_LOW && message.channel.rateLimitPerUser > 0) {
        // disable slowmode
        await message.channel.setRateLimitPerUser(0, 'Activity normalized');
        console.log(`Disabled slowmode in ${message.channel.name}`);
      }
    } catch (err) {
      console.error('Failed to adjust slowmode:', err);
    }
  });
};
