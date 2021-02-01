import { MessageEmbed } from "discord.js";
import { KauriCommand } from "../../../../lib/commands/KauriCommand";
import { KauriMessage } from "../../../../lib/structures/KauriMessage";
import { BattleTag } from "../../../../models/mongo/battletag";

export default class extends KauriCommand {
  constructor() {
    super("battletag-list", {
      aliases: ["battletag-list"],
      category: "Battles",
      description: "Lists battle tags",
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    });
  }

  public async interact(message: KauriMessage, args: Map<string, any>) {
    const tags = await BattleTag.find({}).sort({ tag: 1 });

    const embed = new MessageEmbed()
      .setTitle("Battle Tag Current Standings")
      .setDescription(tags.map(t => `**${t.tag}**: <@${t.user}>`).join("\n"));

    // @ts-ignore
    await this.client.api.interactions(message.id)(message.interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          embeds: [embed.toJSON()]
        }
      }
    });
  }
}