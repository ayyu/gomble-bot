/** @typedef {import('discord.js').Interaction} Interaction */

module.exports = {
	name: 'interactionCreate',
	/**
	 * @param {Interaction} interaction
	 */
	execute(interaction) {
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
		if (interaction.isCommand) {
			console.log(`Command /${interaction.commandName} invoked.`);
			const subcommand = interaction.options.getSubcommand(false);
			if (subcommand) console.log(`Subcommand ${subcommand} was invoked.`);
		}
	},
};
