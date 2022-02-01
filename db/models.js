const sequelize = require('./connect');

const User = require('../models/User')(sequelize);
const Prediction = require('../models/Prediction')(sequelize);
const Bet = require('../models/Bet')(sequelize);

User.hasMany(Bet);
Bet.belongsTo(User);

Prediction.hasMany(Bet);
Bet.belongsTo(Prediction);

module.exports = {
	sequelize,
	User,
	Prediction,
	Bet,
};
