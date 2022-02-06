const sequelize = require('./connect');

const _User = require('../models/User')(sequelize);
const _Prediction = require('../models/Prediction')(sequelize);
const _Bet = require('../models/Bet')(sequelize);

_User.hasMany(_Bet);
_Bet.belongsTo(_User);

_Prediction.hasMany(_Bet);
_Bet.belongsTo(_Prediction);

module.exports = {
	sequelize,
	User: _User, Prediction: _Prediction, Bet: _Bet,
};
