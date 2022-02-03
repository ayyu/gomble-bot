const { CommandInteraction } = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	/**
	 * @param {CommandInteraction} interaction
	 */
	execute(interaction) {
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
		if (interaction.isCommand) console.log(`Command /${interaction.commandName} was invoked.`);
	},
};