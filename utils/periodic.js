const ms = require('ms');
const { wagesKV } = require('../db/keyv');
const { User, Prediction } = require('../db/models');
/**
 * @typedef {import('discord.js').Guild} Guild
 */

/**
 * Pays Users associated with a Guild according to the set schedule.
 * @param {Guild} guild
 */
async function payWages(guild) {
	const amount = await wagesKV.get('amount') ?? 0;
	const boostMultiplier = await wagesKV.get('boost') ?? 1;
	const boostAmount = amount * boostMultiplier;

	await User.findAll()
		.then(async users => {
			const members = await User.getMembers(users, guild.members);
			return Promise.all(users.map(async user => {
				const member = members.get(user.id);
				if (!member) return;
				return user.earn(member.premiumSinceTimestamp ? boostAmount : amount);
			}));
		})
		.then(() => console.log(`Paid ${boostAmount} to boosters and ${amount} to all other users.`))
		.catch(error => console.error(error));

	const interval = await wagesKV.get('interval') ?? '1 min';
	setTimeout(payWages, ms(interval), guild);
	console.log(`Next payment is in ${interval}.`);

	return guild;
}

/**
 * Prunes orphaned Predictions and missing Members from the bot's database.
 * @param {Guild} guild
 */
async function prune(guild) {
	// remove users that aren't in the guild
	await User.findAll()
		.then(async users => {
			const members = await User.getMembers(users, guild.members);
			return Promise.all(users.map(async user => {
				if (members.has(user.id)) return;
				console.log(`Removing missing member with ID ${user.id} from database.`);
				return user.destroy();
			}));
		})
		.catch(error => console.error(error));

	// remove predictions without threads
	await Prediction.findAll()
		.then(predictions => Promise.all(predictions.map(async prediction => {
			return prediction.isOrphaned(guild.channels).then(orphaned => {
				if (!orphaned) return;
				console.log(`Cancelled orphaned prediction with ID ${prediction.id}.`);
				return prediction.cancel();
			});
		})))
		.catch(error => console.error(error));

	return guild;
}

module.exports = {
	payWages,
	prune,
};
