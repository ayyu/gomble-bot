module.exports = {
	paymentMessage(amount, balance) {
		return `You spent **${amount}**. Your new balance is **${balance}**.`
	},
	openBetMsg: `Betting is open. Place bets in the thread with \`/bet\`.`,
	closeBetMsg: `Betting is closed for this prediction.`,
	cancelBetMsg: `This prediction has been cancelled. All bets have been refunded.`,
	channelOnlyMsg: `You can only use this command outside of a thread.`,
	threadOnlyMsg: `You can only use this command in a betting thread.`,
	registeredMsg: `This user is already registered.`,
	unregisteredMsg: `User isn't registered. Use \`/user register\` first.`,
};
