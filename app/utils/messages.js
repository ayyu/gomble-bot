/** @typedef {import("discord.js").MessageOptions} MessageOptions */
const { betStatusNames } = require('./enums');

/**
 * Returns a formatted ephemeral response to be sent in a Message.
 * @param {number} amount - Amount spent
 * @param {number} balance - New balance
 * @returns {MessageOptions} Formatted message.
 */
function paymentMessage(amount, balance) {
	return {
		content: `You spent **${amount}**. Your new balance is **${balance}**.`,
		ephemeral: true,
	};
}

/**
 * Formats an Array of pairs of values into a list string
 * @param {string} title
 * @param {Array<[string, string]>} pairs
 * @param {string} empty - fallback if pairs is empty
 * @returns {string} formatted list
 */
function formatPairs(title, pairs, empty) {
	let response = '';
	if (title) response += `**${title}**\n`;
	if (!pairs.length) response += `> ${empty}\n`;
	pairs.forEach(pair => {
		response += `> **${pair[0]}**: \`${pair[1]}\`\n`;
	});
	return response;
}

const toggleMessages = {
	betStatus: [
		`Betting is ${betStatusNames[+false]}.`,
		`Betting is ${betStatusNames[+true]}. Place bets in the thread with \`/bet\`.`,
	],
	threaded: [
		'You can only use this command outside of a thread.',
		'You can only use this command in a betting thread.',
	],
	registered: [
		'User isn\'t registered. Use `/user register` first.',
		'This user is already registered.',
	],
};

const errorMessages = {
	targetSelf: 'Can\'t target yourself',
};

module.exports = {
	paymentMessage,
	formatPairs,
	toggleMessages, errorMessages,
};
