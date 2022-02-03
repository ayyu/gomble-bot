const { permsKV } = require('../db/keyv');

/**
 * Permission setting for a commmand.
 * @typedef {Object} Permissions
 * @property {string} id
 * @property {string} type
 * @property {boolean} permission
 */

/**
 * Updates permissions for all commands with permission settings stored.
 * @param {import('discord.js').Guild} guild
 */
async function updateCommandPerms(guild) {
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
}

/**
 * Returns basic permissions for a private command accessible by the Guild owner.
 * @param {import('discord.js').Guild} guild
 * @returns {Array<Permissions>}
 */
function getBasePrivatePerms(guild) {
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
}

/**
 * Returns basic permissions for a public command accessible by all Members.
 * @param {import('discord.js').Guild} guild
 * @returns {Array<Permissions>}
 */
function getBasePublicPerms(guild) {
	return [
		{
			id: guild.roles.everyone.id,
			type: 'ROLE',
			permission: true,
		},
	];
}

module.exports = {
	updateCommandPerms,
	getBasePrivatePerms,
	getBasePublicPerms,
};
