const { Model, DataTypes } = require('sequelize');
/**
 * @typedef {import('discord.js').GuildMemberManager} GuildMemberManager
 * @typedef {import('discord.js').Member} Member
 * @typedef {import('discord.js').Collection} Collection
 */

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
			if (amount > this.balance) {
				throw new Error(`Insufficient balance. ${this.balance} available, ${amount} needed.`);
			}
			return this.decrement({ balance: amount }).then(model => model.reload());
		}

		/**
		 * Increments a User instance.
		 * Will round requested amount up to nearest integer.
		 * @param {number} amount - The amount to increment by.
		 * @returns {Promise<this>}
		 */
		async earn(amount) {
			amount = Math.ceil(amount);
			return this.increment({ balance: amount }).then(model => model.reload());
		}

		/**
		 * Fetches the GuildMember corresponding to this instance.
		 * @param {GuildMemberManager} members
		 * @returns {Promise<Member>}
		 */
		async getMember(members) {
			return members.fetch(this.id).catch(() => null);
		}

		/**
		 * Fetches all GuildMembers represented in the array of User instances.
		 * @param {Array} models
		 * @param {GuildMemberManager} members
		 * @returns {Collection<string, Member>}
		 */
		static async getMembers(models, members) {
			return members.fetch({ user: models.map(model => model.id) })
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
