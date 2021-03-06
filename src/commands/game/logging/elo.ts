// import { stripIndents } from 'common-tags';
// import { Argument, Flag } from 'discord-akairo';
// import { GuildMember, Message, MessageEmbed } from 'discord.js';
// import emoji from 'node-emoji';
// import { KauriCommand } from '../../../lib/commands/KauriCommand';
// import { ITrainerDocument, Trainer } from '../../../models/mongo/trainer';
// import { Roles } from '../../../util/constants';

// interface CommandArgs {
//   winner: GuildMember;
//   loser: GuildMember;
// }

// export default class EloCommand extends KauriCommand {
//   constructor() {
//     super('ELO Update', {
//       aliases: ['elo'],
//       category: 'Game',
//       channel: 'guild',
//       clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
//       description: 'Update the ELO rating for two battlers',
//       requiresDatabase: true,
//       usage: 'elo <winner> <loser>',
//       userRoles: [Roles.Staff, Roles.SeniorReferee, Roles.Referee],
//     });
//   }

//   public async onBlocked(message: Message) {
//     if (message.util!.parsed?.content) {
//       const { winner } = await this.parse(message, message.util!.parsed?.content!);
//       if (winner) return this.single(message, winner);
//     }

//     const data: ITrainerDocument[] = await Trainer.find({ 'battleRecord.elo': { $not: { $eq: null } } })
//       .select('_id battleRecord.elo')
//       .sort({ 'battleRecord.elo': -1 });

//     if (data.length === 0) {
//       return new MessageEmbed()
//         .setTitle('Nobody has joined this ladder yet')
//         .setDescription('Partipate in ladder battles to raise your ranking!');
//     }

//     const validMembers: GuildMember[] = data
//       .filter(d => message.guild?.members.cache.has(d.id))
//       .map(d => message.guild?.members.cache.get(d.id)!);
//     const elos = validMembers.map(m => `${emoji.strip(m.displayName).padEnd(30, ' ')} | ${m.trainer.battleRecord.elo}`);

//     const ladder = stripIndents`**URPG ELO Ladder\`\`\`${'Battler'.padEnd(30, ' ')} | ELO\`\`\`**\`\`\`${elos.join(
//       '\n',
//     )}\`\`\``;

//     return message.util!.send(ladder);
//   }

//   public *args(message: Message): any {
//     const winner = yield {
//       type: Argument.validate('member', member => member.id !== message.author.id),
//     };

//     const loser = yield {
//       type: Argument.validate('member', member => member.id !== message.author.id),
//     };

//     return { winner, loser };
//   }

//   private async single(message: Message, battler: GuildMember) {
//     const embed = new MessageEmbed();
//     if (!battler.trainer.battleRecord.elo) {
//       embed.setTitle(`${emoji.strip(battler.displayName)} has not participated in this ladder.`).setColor(0xbbbbbb);
//     } else {
//       embed
//         .setTitle(`${emoji.strip(battler.displayName)}'s ELO is currently: ${battler.trainer.battleRecord.elo}`)
//         .setColor(0xffffff);
//     }

//     embed.setDescription('Partipate in ladder battles to raise your ranking!');
//     return message.util!.send({ embeds: [embed] });
//   }

//   public async exec(message: Message, { winner, loser }: CommandArgs) {
//     if (!loser) return this.onBlocked(message);

//     // Get current ratings
//     const rA = winner.trainer.battleRecord?.elo || 1500;
//     const rB = loser.trainer.battleRecord?.elo || 1500;

//     // Calc expected ratings
//     const eA = 1 / (1 + Math.pow(10, (rB - rA) / 400));
//     const eB = 1 / (1 + Math.pow(10, (rA - rB) / 400));

//     // Set K values
//     const kA = rA > 2000 ? 24 : 32;
//     const kB = rB > 2000 ? 24 : 32;

//     // Calc new ratings
//     const nA = Math.round(rA + kA * (1 - eA));
//     const nB = Math.round(rB + kB * (0 - eB));

//     const embed = new MessageEmbed()
//       .setTitle('ELO Rating Update (Pending)')
//       .addFields([
//         { name: '**Battler**', value: `${winner}\n${loser}`, inline: true },
//         { name: '**ELO**', value: `${rA} => ${nA}\n${rB} => ${nB}`, inline: true },
//       ])
//       .setColor(0x1f8b4c)
//       .setDescription('React to confirm the ELO changes');

//     const prompt = await message.util!.send({ embeds: [embed] });

//     if (await prompt.reactConfirm(message.author.id)) {
//       winner.trainer.battleRecord.elo = nA;
//       loser.trainer.battleRecord.elo = nB;

//       try {
//         await Promise.all([winner.trainer.save(), loser.trainer.save()]);

//         message.client.logger.elo(message, winner, loser);

//         embed.setTitle('ELO Rating Update');
//         embed.footer = null;
//         await prompt.edit({ embeds: [embed] });
//       } catch (e) {
//         message.client.logger.parseError(e);
//       }
//     } else {
//       return prompt.delete();
//     }
//   }
// }
