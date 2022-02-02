const { Bet } = require('../db/models');
const { openBetMsg, closeBetMsg } = require('./messages');

async function startMessageEmbed(prediction, description = null) {
	const predictionId = prediction.id;
	async function buildSubset(choice) {
		const where = { predictionId, choice };
		const pool = await Bet.sum('amount', { where }) ?? 0;
		const max = await Bet.max('amount', { where }) ?? 0;
		const count = await Bet.count({ where }) ?? 0;
		return { pool, max, count };
	}
	const believers = await buildSubset(true);
	const doubters = await buildSubset(false);
	const totalPool = believers.pool + doubters.pool;
	const calcRatio = (subset, total) => (subset.pool == 0) ? 1 : total / subset.pool;
	believers.ratio = calcRatio(believers, totalPool);
	doubters.ratio = calcRatio(doubters, totalPool);
	const subsetToString = s => `💰 ${s.pool}\n🏆 1:${s.ratio.toFixed(2)}\n🧍 ${s.count}\n💪 ${s.max}`;

	const title = prediction.prompt;
	if (description == null) description = (prediction.open) ? openBetMsg : closeBetMsg;
	const fields = [
		{ name: 'Believers', inline: true, value: subsetToString(believers) },
		{ name: 'Doubters', inline: true, value: subsetToString(doubters) },
	];
	return { title, description, fields };
}

module.exports = {
	startMessageEmbed,
};
