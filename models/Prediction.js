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
			return await channels.fetch(this.id).then(thread => thread.fetchStarterMessage())
				.then(() => false)
				.catch(() => true);
		}

		/**
		 * Cancels this Prediction and refunds all associated Bets.
		 */
		async cancel() {
			const bets = await this.getBets();
			return await Promise.all(bets.map(async bet => await bet.refund()))
				.then(() => this.destroy());
		}

		/**
		 * Ends this Prediction and pays out to winners.
		 * Refunds all Bets if no Bets are winning.
		 * @param {boolean} choice - Correct outcome of the Prediction.
		 * @returns {Collection<string, number>} Collection of payouts
		 */
		async end(choice) {
			/** @type {Array<import('../db/models').Bet>*/
			const bets = await this.getBets();

			const winningBets = bets.filter(bet => bet.choice == choice);
			const totalPool = bets.reduce((total, bet) => total + bet.amount, 0);
			const winningPool = winningBets.reduce((total, bet) => total + bet.amount, 0);
			const payouts = new Collection();

			if (!winningBets.length) {
				return this.cancel();
			} else {
				for (const bet of winningBets) {
					const payout = bet.amount / winningPool * totalPool;
					payouts.set(bet.userId, payout);
					await bet.payout(payout);
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
