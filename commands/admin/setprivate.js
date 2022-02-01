const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { permsKV } = require('../../db/keyv');
const { basePrivatePerms, updateCommandPerms } = require('../../utils/permissions');

const data = new SlashCommandSubcommandBuilder()
	.setName('setprivate')
	.setDescription('Sets a command to be accessible only to a specific role')
	.addStringOption(option => option
		.setName('command')
		.setDescription('Which command to be made private')
		.setRequired(true))
	.addRoleOption(option => option
		.setName('role')
		.setDescription('Role to have access')
		.setRequired(true));

module.exports = {
	data,
	async execute(interaction) {
		const guild = interaction.guild;

		const command = interaction.options.getString('command');
		const role = interaction.options.getRole('role');
		
		const perms = basePrivatePerms(guild);
		perms.push({id: role.id, type: 'ROLE', permission: true});

		await permsKV.set(command, perms);
		await interaction.reply(`Saved private role.`);

		await updateCommandPerms(guild);
		await interaction.followUp(`Updated command permissions.`);
	}
};
