const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { pricesKV } = require('../../db/keyv');
const { User } = require('../../db/models');
const { paymentMessage } = require('../../utils/messages');

const data = new SlashCommandSubcommandBuilder()
  .setName('addemote')
  .setDescription(`Add an emote to the server`)
  .addStringOption(option => option
    .setName('attachment')
    .setDescription('URL of image for the emote')
    .setRequired(true))
  .addStringOption(option => option
    .setName('name')
    .setDescription('The name for the emote')
    .setRequired(true));

module.exports = {
  data,
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const user = await User.findOne({where: {id: target.id}});

		const attachment = interaction.options.getString('attachment');
    const name = interaction.options.getString('name');

    const price = await pricesKV.get(data.name) ?? 0;
    const balance = await user.spend(price);
		
    let emoji;
    try {
      emoji = await interaction.guild.emojis.create(attachment, name);
    } catch (error) {
      await user.refund(price);
      console.error(error);
    }

    await interaction.reply(`Added emote <:${emoji.identifier}> as **:${emoji.name}:**`);
    await interaction.followUp(paymentMessage(price, balance));
  },
};
