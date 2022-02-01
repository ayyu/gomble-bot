const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

const data = new SlashCommandSubcommandBuilder()
	.setName('role')
	.setDescription('Set the role that can manage predictions')
	.addRoleOption(option => option
		.setName('role')
		.setDescription('Role for managers')
		.setRequired(true));

module.exports = {
	data,
	async execute(interaction) {
		const target = interaction.member;
		const guild = interaction.guild;
		if (!target.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
		&& target.id != guild.ownerId) throw new Error(`You are not allowed to use this command.`);

		const role = interaction.options.getRole('role');
		(await guild.commands.fetch()).forEach(command => {
			// console.log(command);
			switch(command.name){
				case 'admin': {
					guild.commands.permissions.add({
						command: command.id,
						permissions: [{
							id: guild.roles.everyone.id,
							type: 'ROLE',
							permission: false,
						}, {
							id: guild.ownerId,
							type: 'USER',
							permission: true,
						}],
					});
					break;
				}
				case 'prediction': {
					guild.commands.permissions.add({
						command: command.id,
						permissions: [{
							id: guild.roles.everyone.id,
							type: 'ROLE',
							permission: false,
						}, {
							id: guild.ownerId,
							type: 'USER',
							permission: true,
						}, {
							id: role.id,
							type: 'ROLE',
							permission: true,
						}],
					});
					break;
				}
				default: {
					guild.commands.permissions.add({
						command: command.id,
						permissions: [{
							id: guild.roles.everyone.id,
							type: 'ROLE',
							permission: true,
						}]
					});
					break;
				}
			}
		});
		await interaction.reply(`Updated prediction manager role.`);
	}
};
