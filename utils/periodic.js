const ms = require('ms');
const { wagesKV } = require('../db/keyv');
const { User, Prediction } = require('../db/models');

/**
 * Pays Users associated with a Guild according to the set schedule.
 * @param {import('discord.js').Guild} guild
 */
async function payWages(guild) {
	try {
		const amount = await wagesKV.get('amount') ?? 0;
		const boostMultiplier = await wagesKV.get('boost') ?? 1;
		const boostAmount = amount * boostMultiplier;

		const models = await User.findAll();
		const members = await User.getMembers(models, guild.members);
		await Promise.all(models.map(async model => {
			const member = members.get(model.id);
			if (member) await model.earn(member.premiumSinceTimestamp ? boostAmount : amount);
		}))
			.then(() => console.log(`Paid ${boostAmount} to boosters and ${amount} to all other users.`));

		const interval = await wagesKV.get('interval') ?? '1 min';
		setTimeout(payWages, ms(interval), guild);
		console.log(`Next payment is in ${interval}.`);
	} catch (error) {
		console.error(error);
	}
}

/**
 * Prunes orphaned Predictions and missing Members from the bot's database.
 * @param {import('discord.js').Guild} guild
 */
async function prune(guild) {
	// remove users that aren't in the guild
	try {
		const models = await User.findAll();
		const members = await User.getMembers(models, guild.members);
		await Promise.all(models.map(async model => {
			if (members.has(model.id)) return;
			console.log(`Removed missing member with ID ${model.id} from database.`);
			await model.destroy();
		}));
	} catch (error) {
		console.error(error);
	}
	// remove predictions without threads
	try {
		const models = await Prediction.findAll();
		await Promise.all(models.map(async model => {
			const isOrphaned = await model.isOrphaned(guild.channels);
			if (isOrphaned) await model.cancel();
			console.log(`Cancelled orphaned prediction with ID ${model.id} from database.`);
		}));
	} catch (error) {
		console.error(error);
	}
}

module.exports = {
	payWages,
	prune,
};
