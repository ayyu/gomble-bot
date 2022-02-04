const JSONB = require('json-buffer');
const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { pricesKV } = require('../../db/keyv');
const { Command } = require('../../models/Command');

const data = new SlashCommandSubcommandBuilder()
	.setName('prices')
	.setDescription('See a list of prices set for redemptions');

/**
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function execute(interaction) {
	const store = pricesKV.opts.store;
	const prefix = 'prices:';

	/** @type {Array<{string, string}>} */
	const rows = await store.query(`SELECT * FROM ${store.opts.table} WHERE key LIKE '${prefix}%'`);

	/** @type {Array<import('discord.js').EmbedFieldData>} */
	const pricelist = rows.map((row) => ({
		name: `/redeem ${row.key.replace(prefix, '')}`,
		value: `\`\`\`${JSONB.parse(row.value).value} points\`\`\``,
	})).sort((a, b) => {
		const nameA = a.name.toLowerCase();
		const nameB = b.name.toLowerCase();
		if (nameA == nameB) return 0;
		return (nameA > nameB) ? 1 : -1;
	});
	const embed = new MessageEmbed({
		title: '🛒 Redemption prices',
		fields: pricelist,
	});
	await interaction.reply({ embeds: [embed] });
}

module.exports = new Command(data, execute);
