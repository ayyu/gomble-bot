const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	class User extends Model {
		async spend(amount) {
			if (amount > this.balance) throw new Error(
				`Insufficient balance.\n${this.balance} available, ${amount} needed.`
			);
			await this.decrement({balance: amount});
			await this.reload();
			return this.balance;
		}
		async earn(amount) {
			await this.increment({balance: amount});
			await this.reload();
			return this.balance;
		}
	}
	User.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		balance: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
			validate: {
				min: {
					args: 1,
					msg: `Balance can't be negative`,
				},
			}
		}
	}, {
		sequelize,
		modelName: 'user',
		timestamps: false,
	});
	return User;
};
