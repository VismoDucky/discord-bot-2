// src/modules/protectMother.js
const responses = [
  "No one talks like that to my creator.",
  "Watch your mouth, that's my mother you're talking to!",
  "Careful, you're speaking about royalty here.",
  "Respect her, or deal with me.",
  "Keep it down, that's family you're disrespecting.",
  "Mind your tone. That's my mother you just insulted.",
  "You're crossing a line. She deserves respect.",
  "Say that again and you’ll regret it.",
  "Hold your tongue — that’s my mother’s name.",
  "Disrespect her, and you answer to me.",
  "You think that’s funny? That’s my creator you’re mocking.",
  "You forget yourself — that’s family you’re talking about.",
  "Don’t test me. She’s off-limits.",
  "Choose your words wisely. That’s my mother.",
  "Insult her again and you’ll see my other side.",
  "She is under my protection — watch your words.",
  "That’s not just anyone, that’s my maker.",
  "Talk like that again and we’ll have a problem.",
  "Respect her, always. No exceptions.",
];

const badWords = ["stupid", "ugly", "idiot", "dumb", "fool", "loser", "hate", "trash", "suck", "moron", "jerk", "lame", "pathetic", "worthless", "femboy", "annoying", "nonsense", "ridiculous", "absurd", "crazy", "insane"];
const TARGET_ID = "764602617283870730"; // your Discord ID

function protectMother(message) {
  if (message.author.bot) return;

  const msgContent = message.content.toLowerCase();

  const mentionsYou =
    message.mentions.has(TARGET_ID) ||
    msgContent.includes("Berd", "berd", "androniki", "Androniki") ||
    msgContent.includes("bishopwaffle", "dyno", "Dyno");

  if (!mentionsYou) return;
  if (message.author.id === TARGET_ID) return;

  for (const word of badWords) {
    if (msgContent.includes(word)) {
      const reply = responses[Math.floor(Math.random() * responses.length)];
      message.reply(reply);
      break;
    }
  }
}

module.exports = { protectMother };
