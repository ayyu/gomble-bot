const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	class Bet extends Model {
		/**
		 * Refunds this Bet and destroys it.
		 */
		async refund() {
			return await this.payout(this.amount);
		}
		/**
		 * Pays the User of this Bet and destroys this Bet.
		 * @param {number} amount - Amount to pay to User
		 */
		async payout(amount) {
			return await this.getUser()
				.then(user => user.earn(amount))
				.then(() => this.destroy());
		}
	}
	Bet.init({
		choice: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		amount: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
			allowNull: false,
			validate: {
				min: 1,
			},
		},
		userId: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		predictionId: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
	}, {
		sequelize,
		modelName: 'bet',
		timestamps: true,
	});
	return Bet;
};
