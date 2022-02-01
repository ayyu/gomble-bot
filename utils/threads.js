const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  requireThreaded(interaction) {
    return (interaction.channel.isThread()
      && interaction.channel.ownerId == process.env.CLIENT_ID);
  },
  requireUnthreaded(interaction) {
    return !interaction.channel.isThread();
  },
};