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
  async closeThread(interaction, reason) {
    const starter = await interaction.thread.fetchStarterMessage();
		await starter.unpin();
		await interaction.channel.setLocked(true, reason);
		await interaction.channel.setArchived(true, reason);
  }
};
