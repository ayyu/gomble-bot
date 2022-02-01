const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	class Prediction extends Model {
		
	}
	Prediction.init({
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		open: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			default: true,
		},
		prompt: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	}, {
		sequelize,
		modelName: 'prediction',
		timestamps: true,
	});
	return Prediction;
};
