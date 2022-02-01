const { clientId } = require('../config.json')

module.exports = {
  requireThreaded(interaction) {
    return (interaction.channel.isThread()
      && interaction.channel.ownerId == clientId);
  },
  requireUnthreaded(interaction) {
    return !interaction.channel.isThread();
  },
};