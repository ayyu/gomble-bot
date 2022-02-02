const ms = require('ms');
const { wagesKV } = require('../db/keyv');
const { User } = require('../db/models');

async function payWages(guild) {
	try {
		let amount = await wagesKV.get('amount') ?? 0;
		const boostMultiplier = await wagesKV.get('boostMultiplier') ?? 1;
		const boostAmount = Math.ceil(amount * boostMultiplier);

		const models = await User.findAll();
		for (const model of models) {
			const member = await model.getMember(guild.members);
			if (member && member.premiumSinceTimestamp) {
				console.log(`${member.user.tag} is a booster.`);
				amount = boostAmount;
			}
			await model.earn(amount);
		};
		console.log(`Paid ${boostAmount} to boosters and ${amount} to all other users.`);

		let interval = await wagesKV.get('interval') ?? '1 min';
		setTimeout(payWages, ms(interval), guild);
		console.log(`Next payment is in ${interval}.`);
		
	} catch (error) {
		console.error(error);
	}
}

async function pruneMembers(guild) {
	try {
		const models = await User.findAll();
		for (const model of models) {
			const member = await model.getMember(guild.members);
			if (!member) {
				model.destroy();
				console.log(`Removed missing member ${model.id} from database.`);
			}
		}
	} catch (error) {
		console.error(error);
	}
}

module.exports = {
	payWages,
	pruneMembers,
}