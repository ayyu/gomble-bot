const { SlashCommandBuilder } = require('@discordjs/builders');
const { ParentCommand } = require('../models/Command');

const data = new SlashCommandBuilder()
	.setName('redeem')
	.setDescription('Cash in points for rewards');

module.exports = new ParentCommand(data, __dirname);
