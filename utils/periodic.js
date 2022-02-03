const { Guild } = require('discord.js');
const ms = require('ms');
const { wagesKV } = require('../db/keyv');
const { User, Prediction } = require('../db/models');

/**
 * Pays Users associated with a Guild according to the set schedule.
 * @param {Guild} guild - Guild with members to pay
 */
async function payWages(guild) {
	try {
		const amount = await wagesKV.get('amount') ?? 0;
		const boostMultiplier = await wagesKV.get('boost') ?? 1;
		const boostAmount = amount * boostMultiplier;

		const models = await User.findAll();
		const members = await User.getMembers(models, guild.members);
		for (const model of models) {
			const member = members.get(model.id);
			if (member) {
				if (member.premiumSinceTimestamp) {
					console.log(`${member.user.tag} is a booster.`);
					await model.earn(boostAmount);
				} else {
					await model.earn(amount);
				}
			} else {
				console.log(`User with ID ${model.id} isn't in the server.`);
			}
		}
		console.log(`Paid ${boostAmount} to boosters and ${amount} to all other users.`);

		const interval = await wagesKV.get('interval') ?? '1 min';
		setTimeout(payWages, ms(interval), guild);
		console.log(`Next payment is in ${interval}.`);

	} catch (error) {
		console.error(error);
	}
}

/**
 * Prunes orphaned Predictions and missing Members from the bot's database.
 * @param {Guild} guild - Guild to be pruned
 */
async function prune(guild) {
	// remove users that aren't in the guild
	try {
		const models = await User.findAll();
		const members = await User.getMembers(models, guild.members);
		for (const model of models) {
			if (!members.has(model.id)) {
				model.destroy();
				console.log(`Removed missing member with ID ${model.id} from database.`);
			}
		}
	} catch (error) {
		console.error(error);
	}
	// remove predictions without threads
	try {
		const models = await Prediction.findAll();
		for (const model of models) {
			const isOrphaned = await model.isOrphaned(guild.channels);
			if (isOrphaned) model.cancel();
			console.log(`Cancelled orphaned prediction with ID ${model.id} from database.`);
		}
	} catch (error) {
		console.error(error);
	}
}

module.exports = {
	payWages,
	prune,
};