const JSONB = require('json-buffer');
const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { pricesKV } = require('../../db/keyv');

const data = new SlashCommandSubcommandBuilder()
	.setName('prices')
	.setDescription('See a list of prices set for redemptions');

module.exports = {
	data,
	async execute(interaction) {
		const store = pricesKV.opts.store;
		const prefix = 'prices:';
		const rows = await store.query(`SELECT * FROM ${store.opts.table} WHERE key LIKE '${prefix}%'`);
		const pricelist = rows.map((row) => {
			return {
				name: `/${row.key.replace(prefix, '')}`,
				value: `\`\`\`${JSONB.parse(row.value).value} points\`\`\``,
			};
		});
		pricelist.sort((a, b) => {
			const nameA = a.name.toLowerCase();
			const nameB = b.name.toLowerCase();
			if (nameA == nameB) return 0;
			return (nameA > nameB) ? 1 : -1;
		});
		const embed = {
			title: '🛒 Redemption prices',
			fields: pricelist,
		};
		await interaction.reply({ embeds: [embed] });
	},
};
