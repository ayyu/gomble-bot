const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { pricesKV } = require('../../db/keyv');
const { User } = require('../../db/models');
const { paymentMessage } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
  .setName('forcewatch')
  .setDescription(`Force a user to watch a show of your choice`)
  .addUserOption(option => option
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
    const invoker = interaction.member;
    const target = interaction.options.getMember('user');
		if (invoker.id == target.id) throw new Error(`Can't target yourself`);
    const invokerModel = await User.findOne({where: {id: invoker.id}});

		const show = interaction.options.getString('show');
    
    const price = await pricesKV.get(data.name) ?? 0;
    const balance = await invokerModel.spend(price);
		
    await interaction.reply(`${invoker} forces ${target} to watch ${show}`);
    await interaction.followUp(paymentMessage(price, balance));
  },
};
