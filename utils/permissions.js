const { Guild } = require('discord.js');
const { permsKV } = require('../db/keyv');

module.exports = {
	/**
	 * Updates permissions for all commands with permission settings stored.
	 * @param {Guild} guild - Guild with commands to update
	 */
	async updateCommandPerms(guild) {
		const commands = await guild.commands.fetch();
		commands.forEach(async command => {
			const name = command.name;
			const permissions = await permsKV.get(name);
			if (permissions != null) {
				await guild.commands.permissions.add({
					command: command.id,
					permissions,
				});
			}
		});
	},
	/**
	 * Returns basic permissions for a private command accessible by the Guild owner.
	 * @param {Guild} guild - Guild with roles
	 * @returns {Array<Object>}
	 */
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
	/**
	 * Returns basic permissions for a public command accessible by all Members.
	 * @param {Guild} guild - Guild with roles
	 * @returns {Array<Object>}
	 */
	basePublicPerms(guild) {
		return [
			{
				id: guild.roles.everyone.id,
				type: 'ROLE',
				permission: true,
			},
		];
	},
};