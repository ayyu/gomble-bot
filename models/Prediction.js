const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	class Prediction extends Model {
		async isOrphaned(channels) {
			try {
				await channels.fetch(this.id);
			} catch (error) {
				console.error(error);
				return true;
			}
			return false;
		}
		async cancel() {
			const bets = await this.getBets();
			for (const bet of bets) await bet.refund();
			await this.destroy();
		}
		async end(choice) {
			const bets = await this.getBets();
			const winningBets = bets.filter(bet => bet.choice == choice);
			const totalPool = bets.reduce((total, bet) => total + bet.amount, 0);
			const winningPool = winningBets.reduce((total, bet) => total + bet.amount, 0);
			const payouts = {};
			for (const bet of winningBets) {
				const payout = bet.amount / winningPool * totalPool;
				payouts[bet.userId] = payout;
				await bet.payout(payout);
				await bet.destroy();
			}
			await this.destroy();
			return [totalPool, payouts];
		}
	}
	Prediction.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		open: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			default: true,
		},
		prompt: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	}, {
		sequelize,
		modelName: 'prediction',
		timestamps: true,
	});
	return Prediction;
};
