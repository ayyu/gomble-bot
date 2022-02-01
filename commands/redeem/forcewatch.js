const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { pricesKV } = require('../../db/keyv');
const { User } = require('../../db/models');
const { paymentMessage } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
  .setName('forcewatch')
  .setDescription(`Force a user to watch a show of your choice`)
  .addStringOption(option => option
    .setName('user')
    .setDescription('User to target')
    .setRequired(true))
  .addStringOption(option => option
    .setName('show')
    .setDescription('Show to watch')
    .setRequired(true));

module.exports = {
  data,
  async execute(interaction) {
    const target = interaction.options.getMember('user');
		if (interaction.member.id == target.id) throw new Error(`Can't target yourself`);
    const user = await User.findOne({where: {id: target.id}});

		const show = interaction.options.getString('show');
    
    const price = await pricesKV.get(data.name) ?? 0;
    const balance = await user.spend(price);
		
    await interaction.reply(`${interaction.member} forces ${target} to watch ${show}`);
    await interaction.followUp(paymentMessage(price, balance));
  },
};
