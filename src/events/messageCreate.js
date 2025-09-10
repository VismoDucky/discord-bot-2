// src/events/messageCreate.js
const { protectMother } = require("../modules/protectMother");

module.exports = {
  name: "messageCreate",
  async execute(message) {
    protectMother(message);
  },
};

