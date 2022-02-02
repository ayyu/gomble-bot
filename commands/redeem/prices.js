const JSONB = require('json-buffer');
const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { pricesKV } = require('../../db/keyv');

const data = new SlashCommandSubcommandBuilder()
  .setName('prices')
  .setDescription(`See a list of prices set for redemptions`);

module.exports = {
  data,
  async execute(interaction) {
		const store = pricesKV.opts.store;
		const prefix = `${store.namespace}:`;
		const rows = await store.query(`SELECT * FROM ${store.opts.table} WHERE key LIKE '${prefix}%'`);
		const pricelist = rows.map((row) => {
			return {
				name: row.key.replace(prefix, ''),
				value: `${JSONB.parse(row.value).value}`,
				inline: true,
			}
		});
		await interaction.reply({embeds: [{
			title: 'Redemption prices',
			fields: pricelist
		}]});
  },
};
