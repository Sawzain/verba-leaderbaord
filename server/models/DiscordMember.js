const mongoose = require("mongoose");

// A copy of the Discord server's member list, kept current by the bot.
// Only used to power the "suggest a Discord ID" autofill in Manage.
const discordMemberSchema = new mongoose.Schema(
  {
    discordId: { type: String, required: true, unique: true },
    username: { type: String, default: "" },
    displayName: { type: String, default: "" },
    roles: {
      type: [{ _id: false, id: String, name: String, color: String }],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DiscordMember", discordMemberSchema);