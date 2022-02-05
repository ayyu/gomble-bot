const { Model, DataTypes } = require('sequelize');
const { Collection } = require('discord.js');

/**
 * @typedef {import('discord.js').GuildChannelManager} GuildChannelManager
 * @typedef {import('../db/models').Bet} Bet
 */

module.exports = (sequelize) => {


	class Prediction extends Model {
		/**
		 * Returns whether Prediction is missing an associated thread or starter Message.
		 * @param {GuildChannelManager} channels
		 * @returns {Promise<boolean>} true if missing a thread or starter Message, false otherwise
		 */
		async isOrphaned(channels) {
			return channels.fetch(this.id)
				.then(thread => thread.fetchStarterMessage())
				.then(() => false)
				.catch(() => true);
		}

		/**
		 * Cancels this Prediction and refunds all associated Bets.
		 * @returns {Promise<void>}
		 */
		async cancel() {
			return this.getBets()
				.then(bets => Promise.all(
					bets.map(async bet => bet.refund())))
				.then(() => this.destroy());
		}

		/**
		 * Ends this Prediction and pays out to winners.
		 * Refunds all Bets if no Bets are winning.
		 * @param {boolean} choice - Correct outcome of the Prediction.
		 * @returns {Promise<Collection<string, number>>} Collection of payouts
		 */
		async end(choice) {
			await this.getBets()
				.then(bets => {
					const winningBets = bets.filter(bet => bet.choice == choice);
					const totalPool = bets.reduce((total, bet) => total + bet.amount, 0);
					const winningPool = winningBets.reduce((total, bet) => total + bet.amount, 0);

					if (!winningBets.length) return this.cancel();

					const payouts = new Collection();
					return Promise.all(bets.map(async bet => {
						const userId = bet.userId;
						const payout = bet.amount / winningPool * totalPool;
						bet.payout(payout);
						payouts.set(userId, payout);
					}))
						.then(() => this.destroy())
						.then(() => payouts);
				});
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
