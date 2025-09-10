module.exports = (client, momId, dadId) => {
  const scoldKeywords = ['bad bot', 'stupid', 'don’t do that', 'stop it'];

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const isMom = message.author.id === momId;
    const isDad = message.author.id === dadId;

    // === Greetings ===
    if (Math.random() < 0.1) {
      const greetingsMom = [
        "Hello mom! 😳",
        "Hey mom! 😅",
        "Hi mom, did you need something? 😳"
      ];
      const greetingsDad = [
        "Hey dad! 😎",
        "Yo dad, what's up? 😏",
        "Hi dad, how's it going? 😎"
      ];

      if (isMom) {
        await message.channel.send(greetingsMom[Math.floor(Math.random() * greetingsMom.length)]);
      } else if (isDad) {
        await message.channel.send(greetingsDad[Math.floor(Math.random() * greetingsDad.length)]);
      }
    }

    // === Scolding detection ===
    const isScolding = (isMom || isDad) &&
                       scoldKeywords.some(word => message.content.toLowerCase().includes(word));

    if (isScolding) {
      const scoldRepliesMom = [
        "😱 I'm sorry mom! I won't do it again!",
        "😳 P-please forgive me, mom!",
        "😢 I didn’t mean to, mom!",
        "🙏 I promise I'll behave, mom!"
      ];
      const scoldRepliesDad = [
        "😳 Sorry dad! Won’t happen again!",
        "😅 My bad dad!",
        "😢 I didn’t mean to, dad!",
        "🙏 I’ll behave, dad!"
      ];

      if (isMom) {
        await message.channel.send(scoldRepliesMom[Math.floor(Math.random() * scoldRepliesMom.length)]);
        await message.react('😳');
      } else if (isDad) {
        await message.channel.send(scoldRepliesDad[Math.floor(Math.random() * scoldRepliesDad.length)]);
        await message.react('😎');
      }
    }

    // === Occasional silly messages ===
    if (Math.random() < 0.00002) { // Very rare
      const sillyMom = [
        "I hope mom isn’t mad at me 😅",
        "Oops, did I do that? 😳",
        "Sometimes I just panic... 😨",
        "Hey guys, don't tell anyone but I kinda smoked a little weed once... 😳"
      ];
      const sillyDad = [
        "Hope dad is chill 😎",
        "Hehe dad, I messed up again 😅",
        "Just vibing, dad 😏"
      ];

      if (isMom) await message.channel.send(sillyMom[Math.floor(Math.random() * sillyMom.length)]);
      if (isDad) await message.channel.send(sillyDad[Math.floor(Math.random() * sillyDad.length)]);
    }
  });
};
