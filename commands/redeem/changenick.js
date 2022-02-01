const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { pricesKV } = require('../../db/keyv');
const { User } = require('../../db/models');
const { paymentMessage } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
  .setName('changenick')
  .setDescription(`Change a user's nickname`)
  .addUserOption(option => option
    .setName('user')
    .setDescription('User to target')
    .setRequired(true))
  .addStringOption(option => option
    .setName('nick')
    .setDescription('Nickname to use')
    .setRequired(true));

module.exports = {
  data,
  async execute(interaction) {
    const invoker = interaction.member;
    const target = interaction.options.getMember('user');
    const nick = interaction.options.getString('nick');
    
    if (invoker.id == target.id) throw new Error(`Can't target yourself`);

    const invokerModel = await User.findOne({where: {id: invoker.id}});
		const price = await pricesKV.get(data.name) ?? 0;
    const balance = await invokerModel.spend(price);

    await target.setNickname(nick);
		
    await interaction.reply(`Nickname changed for ${target}`);
    await interaction.followUp(paymentMessage(price, balance));
  },
};
