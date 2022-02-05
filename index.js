const path = require('path');
const { Client, Collection, Intents } = require('discord.js');
const { absForEach } = require('./utils/fs');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const commands = new Collection();
absForEach(path.resolve(__dirname, './commands'), /\.js$/, (directory, file) => {
	const command = require(`${directory}/${file}`);
	commands.set(command.data.name, command);
});

absForEach(path.resolve(__dirname, './events'), /\.js$/, (directory, file) => {
	const event = require(`${directory}/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = commands.get(interaction.commandName);
	if (command) await command.execute(interaction);
});

client.login(process.env.DISCORD_TOKEN);
