const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Prediction } = require('../../db/models');
const { requireUnthreaded } = require('../../utils/threads');
const { startMessageEmbed } = require('../../utils/embeds');

const data = new SlashCommandSubcommandBuilder()
	.setName('start')
	.setDescription('Starts a new prediction')
		.addStringOption(option => option
			.setName('prompt')
			.setDescription('Prompt for prediction')
			.setRequired(true));

module.exports = {
	data,
	async execute(interaction) {
		if (!requireUnthreaded(interaction)) throw new Error(`You can only start predictions outside of threads.`);
		const prompt = interaction.options.getString('prompt');
		
		const reply = await interaction.reply({
			content: `**Prediction**`,
			fetchReply: true,
		});

		const thread = await reply.startThread({
			name: `${prompt}`,
			autoArchiveDuration: 'MAX',
			reason: 'New prediction started: ${exchangeName}',
		});
		
		const prediction = await Prediction.create({
			id: thread.id,
			prompt,
			open: true,
		});

		const embed = await startMessageEmbed(prediction);
		await reply.edit({embeds: [embed]});
		await reply.pin();
	},
};
