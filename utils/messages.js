module.exports = {
	/**
	 * Returns a formatted ephemeral response to be sent in a Message.
	 * @param {Number} amount - Amount spent
	 * @param {Number} balance - New balance
	 * @returns {Object<String, Boolean>} Formatted message.
	 */
	paymentMessage(amount, balance) {
		return {
			content: `You spent **${amount}**. Your new balance is **${balance}**.`,
			ephemeral: true,
		};
	},
	openBetMsg: 'Betting is open. Place bets in the thread with `/bet`.',
	closeBetMsg: 'Betting is closed for this prediction.',
	channelOnlyMsg: 'You can only use this command outside of a thread.',
	threadOnlyMsg: 'You can only use this command in a betting thread.',
	registeredMsg: 'This user is already registered.',
	unregisteredMsg: 'User isn\'t registered. Use `/user register` first.',
	cantTargetSelfMsg: 'Can\'t target yourself',
};
