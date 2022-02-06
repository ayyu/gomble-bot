const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { permsKV } = require('../../db/keyv');
const { Command } = require('../../models/Command');
const { permissionModes } = require('../../utils/enums');
const { getBasePrivatePerms, getBasePublicPerms, updateCommandPerms } = require('../../utils/permissions');
/** @typedef {import('discord.js').CommandInteraction} CommandInteraction */

const data = new SlashCommandSubcommandBuilder()
	.setName('perms')
	.setDescription('Sets permissions for a command')
	.addStringOption(option => option
		.setName('command')
		.setDescription('Command to set permissions for')
		.setRequired(true))
	.addIntegerOption(option => option
		.setName('mode')
		.setDescription('Public or private')
		.addChoices(permissionModes.map((value, index) => [value, index]))
		.setRequired(true))
	.addRoleOption(option => option
		.setName('role')
		.setDescription('Role to have access if private'));

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	const guild = interaction.guild;
	const command = interaction.options.getString('command');
	const mode = interaction.options.getInteger('mode');
	const role = interaction.options.getRole('role');

	const perms = [
		getBasePublicPerms(guild),
		getBasePrivatePerms(guild),
	][mode];
	if (role) perms.push({ id: role.id, type: 'ROLE', permission: true });

	return permsKV.set(command, perms)
		.then(() => interaction.reply(`Saved command \`/${command}\` as ${permissionModes[mode]}.`))
		.then(() => updateCommandPerms(guild))
		.then(() => interaction.followUp('Updated command permissions.'));
}

module.exports = new Command(data, execute);
