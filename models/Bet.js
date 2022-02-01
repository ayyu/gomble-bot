const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	class Bet extends Model {
		async refund() {
			const user = await this.getUser();
			await user.earn(this.amount);
			await user.reload();
			await this.destroy();
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
				msg: `Amount must be at least 1`,
			}
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
