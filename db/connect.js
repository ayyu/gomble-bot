const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

/**
 * ORM instance for bot storage.
 */
const sequelize = new Sequelize(process.env.DATABASE_URL, {
	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false,
		},
	},
	logging: false,
});

sequelize
	.authenticate()
	.then(() => console.log('Connection to database successful'))
	.catch(err => console.error('Unable to connect to the database:', err));

module.exports = sequelize;
