const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	class User extends Model {
		/**
		 * Decrements and reloads a User instance if their balance is sufficient.
		 * Will round requested amount up to nearest integer.
		 * @param {number} amount - The amount to decrement by.
		 * @throws {Error} The user doesn't have enough balance.
		 * @returns {Promise<this>}
		 */
		async spend(amount) {
			amount = Math.ceil(amount);
			if (amount > this.balance) throw new Error(`Insufficient balance. ${this.balance} available, ${amount} needed.`);
			return await this.decrement({ balance: amount })
				.then(model => model.reload());
		}

		/**
		 * Increments a User instance.
		 * Will round requested amount up to nearest integer.
		 * @param {number} amount - The amount to increment by.
		 * @returns {Promise<this>}
		 */
		async earn(amount) {
			amount = Math.ceil(amount);
			return await this.increment({ balance: amount })
				.then(model => model.reload());
		}

		/**
		 * Fetches the GuildMember corresponding to this instance.
		 * @param {import('discord.js').GuildMemberManager} members
		 * @returns {Promise<import('discord.js').Member>}
		 */
		async getMember(members) {
			return await (members.fetch(this.id))
				.catch(() => null);
		}

		/**
		 * Fetches all GuildMembers represented in the array of User instances.
		 * @param {Array} models
		 * @param {import('discord.js').GuildMemberManager} members
		 * @returns {import('discord.js').Collection<string, import('discord.js').Member>}
		 */
		static async getMembers(models, members) {
			return await members.fetch({ user: models.map(model => model.id) })
				.catch(() => null);
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
