const { Bet } = require('../db/models');
const { openBetMsg, closeBetMsg } = require('./messages');

function getChoiceStats(bets, totalPool) {
	const pool = bets.reduce((total, bet) => total + bet.amount, 0);
	const ratio = (pool == 0) ? 1 : totalPool / pool;
	const count = bets.length;
	const max = bets.reduce((lowest, bet) => Math.max(lowest, bet.amount), 0);
	return { pool, max, ratio, count };
}

async function buildBetFields(prediction) {
	const bets = await Bet.findAll({ where: { predictionId: prediction.id } });
	const totalPool = bets.reduce((total, bet) => total + bet.amount, 0);
	const choices = [true, false];
	return choices.map(choice => {
		const chosenBets = bets.filter(bet => bet.choice == choice);
		const { pool, max, ratio, count } = getChoiceStats(chosenBets, totalPool);
		const name = choice ? 'Believers' : 'Doubters';
		const value = `💰 ${pool}\n🏆 1:${ratio.toFixed(2)}\n🧍 ${count}\n💪 ${max}`;
		return { name, value, inline: true };
	});
}

async function startMessageEmbed(prediction, description = null) {
	const title = prediction.prompt;
	if (description == null) description = (prediction.open) ? openBetMsg : closeBetMsg;
	const fields = await buildBetFields(prediction);
	return { title, description, fields };
}

module.exports = {
	startMessageEmbed,
	buildBetFields,
};
