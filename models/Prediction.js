const { Model, DataTypes } = require('sequelize');
const { Collection } = require('discord.js');

module.exports = (sequelize) => {
	class Prediction extends Model {
		/**
		 * Returns whether Prediction is missing an associated thread or starter Message.
		 * @param {import('discord.js').GuildChannelManager} channels
		 * @returns {boolean} true if missing a thread or starter Message, false otherwise
		 */
		async isOrphaned(channels) {
			try {
				/** @type {import('discord.js').ThreadChannel} */
				const thread = await channels.fetch(this.id);
				await thread.fetchStarterMessage();
			} catch (error) {
				console.error(error);
				return true;
			}
			return false;
		}

		/**
		 * Cancels this Prediction and refunds all associated Bets.
		 */
		async cancel() {
			const bets = await this.getBets();
			for (const bet of bets) await bet.refund();
			await this.destroy();
		}

		/**
		 * Ends this Prediction and pays out to winners.
		 * Refunds all Bets if no Bets are winning.
		 * @param {boolean} choice - Correct outcome of the Prediction.
		 * @returns {Collection<string, number>} Collection of payouts
		 */
		async end(choice) {
			/** @type {Array<Bet>} */
			const bets = await this.getBets();

			const winningBets = bets.filter(bet => bet.choice == choice);
			const totalPool = bets.reduce((total, bet) => total + bet.amount, 0);
			const winningPool = winningBets.reduce((total, bet) => total + bet.amount, 0);
			const payouts = new Collection();

			if (!winningBets.length) {
				this.cancel();
			} else {
				for (const bet of winningBets) {
					const payout = bet.amount / winningPool * totalPool;
					payouts.set(bet.userId, payout);
					await bet.payout(payout);
					await bet.destroy();
				}
				await this.destroy();
			}
			return payouts;
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
