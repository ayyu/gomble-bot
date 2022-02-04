const currencySettings = {
	interval: {
		type: 'String',
		description: 'Payment tick interval',
	},
	amount: {
		type: 'Integer',
		description: 'Payment amount per tick',
	},
	initial: {
		type: 'Integer',
		description: 'Initial balance for new users',
	},
	boost: {
		type: 'Number',
		description: 'Payment multiplier for boosters',
	},
	minbet: {
		type: 'Integer',
		description: 'Minimum bet amount',
	},
	discount: {
		type: 'Number',
		description: 'Discount vs. hitlist members',
	},
};

module.exports = {
	currencySettings,
};
