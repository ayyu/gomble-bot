module.exports = {
	name: 'interactionCreate',
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 */
	execute(interaction) {
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
		if (interaction.isCommand) console.log(`Command /${interaction.commandName} was invoked.`);
	},
};
