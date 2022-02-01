const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { pricesKV } = require('../../db/keyv');

const data = new SlashCommandSubcommandBuilder()
  .setName('prices')
  .setDescription(`See a list of prices set for redemptions`);

module.exports = {
  data,
  async execute(interaction) {
		const store = pricesKV.opts.store;
		const rows = await store.query(`SELECT * FROM ${store.opts.table} WHERE key LIKE '${store.namespace}:%'`);
		console.log(rows);
  },
};
