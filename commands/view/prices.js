const JSONB = require('json-buffer');
const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { pricesKV } = require('../../db/keyv');
const { Command } = require('../../models/Command');
/**
 * @typedef {import('discord.js').CommandInteraction} CommandInteraction
 */

const data = new SlashCommandSubcommandBuilder()
	.setName('prices')
	.setDescription('View prices set for redemptions');

/**
 * @param {CommandInteraction} interaction
 */
async function execute(interaction) {
	const store = pricesKV.opts.store;
	const prefix = 'prices:';

	await store.query(`SELECT * FROM ${store.opts.table} WHERE key LIKE '${prefix}%'`)
		.then(rows => rows.map(row => ({
			name: `${row.key.replace(prefix, '')}`,
			value: `\`\`\`${JSONB.parse(row.value).value} points\`\`\``,
			inline: true,
		})).sort((a, b) => {
			const nameA = a.name.toLowerCase();
			const nameB = b.name.toLowerCase();
			if (nameA == nameB) return 0;
			return (nameA > nameB) ? 1 : -1;
		}))
		.then(pricelist => new MessageEmbed({
			title: '🛒 /redeem prices',
			fields: pricelist,
			inline: true,
		}))
		.then(embed => interaction.reply({ embeds: [embed] }));
}

module.exports = new Command(data, execute);
