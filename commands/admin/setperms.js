const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { permsKV } = require('../../db/keyv');
const { basePrivatePerms, basePublicPerms, updateCommandPerms } = require('../../utils/permissions');

const modes = [
	'public',
	'private',
];

const data = new SlashCommandSubcommandBuilder()
	.setName('setperms')
	.setDescription('Sets permissions for a command')
	.addStringOption(option => option
		.setName('command')
		.setDescription('Command to set permissions for')
		.setRequired(true))
	.addStringOption(option => option
		.setName('mode')
		.setDescription('Public or private')
		.addChoices(modes.map(x => [x, x]))
		.setRequired(true))
	.addRoleOption(option => option
		.setName('role')
		.setDescription('Role to have access if private'));

module.exports = {
	data,
	/**
	 * @param {CommandInteraction} interaction
	 */
	async execute(interaction) {
		const guild = interaction.guild;

		const command = interaction.options.getString('command');
		const mode = interaction.options.getString('mode');
		const role = interaction.options.getRole('role');

		switch (mode) {
			case 'public': {
				await permsKV.set(command, basePublicPerms(guild));
				await interaction.reply(`Saved public command \`/${command}\`.`);
				break;
			}
			case 'private': {
				const perms = basePrivatePerms(guild);
				if (role) perms.push({ id: role.id, type: 'ROLE', permission: true });
				await permsKV.set(command, perms);
				await interaction.reply(`Saved private command \`/${command}\``);
				break;
			}
		}

		await updateCommandPerms(guild);
		await interaction.followUp('Updated command permissions.');
	},
};
