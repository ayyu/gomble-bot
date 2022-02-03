const { GuildMember, GuildMemberManager, Collection } = require('discord.js');
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	class User extends Model {
		/**
		 * Decrements and reloads a User instance if their balance is sufficient.
		 * Will round requested amount up to nearest integer.
		 * @param {number} amount - The amount to decrement by.
		 * @throws {Error} The user doesn't have enough balance.
		 * @returns {number} New balance
		 */
		async spend(amount) {
			amount = Math.ceil(amount);
			if (amount > this.balance) {
				throw new Error(`Insufficient balance. ${this.balance} available, ${amount} needed.`);
			}
			await this.decrement({ balance: amount });
			await this.reload();
			return this.balance;
		}

		/**
		 * Increments a User instance.
		 * Will round requested amount up to nearest integer.
		 * @param {number} amount - The amount to increment by.
		 * @returns {number} New balance
		 */
		async earn(amount) {
			amount = Math.ceil(amount);
			await this.increment({ balance: amount });
			await this.reload();
			return this.balance;
		}

		/**
		 * Fetches the GuildMember corresponding to this instance.
		 * @param {GuildMemberManager} members
		 * @returns {GuildMember}
		 */
		async getMember(members) {
			try {
				const member = await members.fetch(this.id);
				return member;
			} catch (error) {
				console.error(error);
				return null;
			}
		}

		/**
		 * Fetches all GuildMembers represented in the array of User instances.
		 * @param {Array} models
		 * @param {GuildMemberManager} members
		 * @returns {Collection<GuildMember>}
		 */
		static async getMembers(models, members) {
			try {
				const collection = await members.fetch({ user: models.map(model => model.id) });
				return collection;
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
