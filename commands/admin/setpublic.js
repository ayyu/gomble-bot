const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { permsKV } = require('../../db/keyv');
const { basePublicPerms, updateCommandPerms } = require('../../utils/permissions');

const data = new SlashCommandSubcommandBuilder()
	.setName('setpublic')
	.setDescription('Sets a command to be accessible to all users')
	.addStringOption(option => option
		.setName('command')
		.setDescription('Which command to be made public')
		.setRequired(true));

module.exports = {
	data,
	async execute(interaction) {
		const guild = interaction.guild;

		const command = interaction.options.getString('command');
		
		await permsKV.set(command, basePublicPerms(guild));
		await interaction.reply(`Saved public command.`);

		await updateCommandPerms(guild);
		await interaction.followUp(`Updated command permissions.`);
	}
};
