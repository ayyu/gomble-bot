const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { wagesKV } = require('../../db/keyv');

const data = new SlashCommandSubcommandBuilder()
	.setName('wage')
	.setDescription('Checks the current server wage settings');

module.exports = {
	data,
	async execute(interaction) {
		const keys = ['interval', 'amount', 'initial', 'boost'];
		const settings = {};

		for (const key of keys) settings[key] = await wagesKV.get(key) ?? null;

		const embed = {
			title: 'Current wage settings',
			fields: [
				{
					name: 'Payment tick interval',
					value: `\`\`\`${settings['interval']}\`\`\``,
				},
				{
					name: 'Payment amount per tick',
					value: `\`\`\`${settings['amount']}\`\`\``,
				},
				{
					name: 'Payment multiplier for boosters',
					value: `\`\`\`${settings['boost']}\`\`\``,
				},
				{
					name: 'Initial balance for new users',
					value: `\`\`\`${settings['initial']}\`\`\``,
				},
			],
		};

		await interaction.reply({ embeds: [embed] });
	},
};