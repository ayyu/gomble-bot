const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { pricesKV } = require('../../db/keyv');
const { User } = require('../../db/models');
const { paymentMessage, cantTargetSelfMsg } = require('../../utils/messages');

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
    const member = interaction.member;
    const target = interaction.options.getMember('user');
		const show = interaction.options.getString('show');

    if (member.id == target.id) throw new Error(cantTargetSelfMsg);

    const user = await User.findOne({where: {id: member.id}});
    const price = await pricesKV.get(data.name) ?? 0;
    
    let reply;
    const balance = await user.spend(price);
    try {
			reply = await interaction.reply(`${member} forces ${target} to watch ${show}`);
		} catch (error) {
			await user.earn(price);
			throw error;
		}
		
    await reply.pin();
    await interaction.followUp(paymentMessage(price, balance));
  },
};
