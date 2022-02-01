const { permsKV } = require('../db/keyv')

module.exports = {
	async updateCommandPerms(guild) {
		(await guild.commands.fetch()).forEach(async command => {
			const name = command.name;
			const hasPerm = await permsKV.has(name);
			if (hasPerm) {
				const permissions = await permsKV.get(name);
				await guild.commands.permissions.add({
					command: command.id,
					permissions,
				});
			}
		});
	},
	basePrivatePerms(guild) {
		return [
			{
				id: guild.roles.everyone.id,
				type: 'ROLE',
				permission: false,
			},
			{
				id: guild.ownerId,
				type: 'USER',
				permission: true,
			},
		];
	},
	basePublicPerms(guild) {
		return [
			{
				id: guild.roles.everyone.id,
				type: 'ROLE',
				permission: true,
			},
		];
	}
}