const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	class User extends Model {
		async spend(amount) {
			if (amount > this.balance) {
				throw new Error(`Insufficient balance.\n${this.balance} available, ${amount} needed.`);
			}
			await this.decrement({ balance: amount });
			await this.reload();
			return this.balance;
		}
		async earn(amount) {
			await this.increment({ balance: amount });
			await this.reload();
			return this.balance;
		}
		async getMember(members) {
			try {
				const member = await members.fetch(this.id);
				return member;
			} catch (error) {
				console.error(error);
				return null;
			}
		}
	}
	User.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		balance: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 0,
			},
		},
	}, {
		sequelize,
		modelName: 'user',
		timestamps: false,
	});
	return User;
};
