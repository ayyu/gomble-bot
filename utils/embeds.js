const { Bet } = require("../db/models");

module.exports = {
	async startMessageEmbed(prediction) {
		const predictionId = prediction.id;
		const buildSubset = async (choice) => {
			const where = {predictionId, choice};
			const pool = await Bet.sum('amount', {where}) ?? 0;
			const max = await Bet.max('amount', {where}) ?? 0;
			const count = await Bet.count({where}) ?? 0;
			return {pool, max, count};
		}
		const believers = await buildSubset(true);
		const doubters = await buildSubset(false);
		const totalPool = believers.pool + doubters.pool;
		const calcRatio = (subset, total) => (subset.pool == 0) ? 1 : total/subset.pool;
		believers.ratio = calcRatio(believers, totalPool);
		doubters.ratio = calcRatio(doubters, totalPool);
		const subsetToString = s => `💰 ${s.pool}\n🏆 1:${s.ratio.toFixed(2)}\n🧍 ${s.count}\n💪 ${s.max}`;

		const title = prediction.prompt;
		const description = (prediction.open)
			? 'Betting is open. Place bets in the thread with \`/bet\`'
			: 'Betting is closed.';
		const fields = [
			{ name: 'Believers', inline: true, value: subsetToString(believers), },
			{ name: 'Doubters', inline: true, value: subsetToString(doubters), },
		];
		return {title, description, fields};
	},
	async resultEmbed(prediction, choice) {
		const predictionId = prediction.id;
		const winners = choice ? 'Believers' : 'Doubters';
		const totalPool = await Bet.sum('amount', {where: {predictionId}});
		const numWinners = await Bet.count('amount', {where: {predictionId, choice}});
		const title = `${winners} are correct`;
		const description = `**${totalPool}** go to ${numWinners} users`;
		return {title, description};
	}
}