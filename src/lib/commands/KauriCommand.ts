import { Command, CommandOptions, PrefixSupplier } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { Roles } from '../../util/constants';

interface IKauriCommand {
  defaults: {
    disabled: boolean;
    configurable: boolean;
  };
  usage?: string | string[];
  userRoles?: Roles[];
  requiresDatabase: boolean;
}

declare module 'discord-akairo' {
  interface Command extends IKauriCommand {}
}

interface KauriCommandOptions extends CommandOptions {
  defaults?: {
    disabled?: boolean;
    configurable?: boolean;
  };
  usage?: string | string[];
  userRoles?: Roles[];
  requiresDatabase?: boolean;
}

const COMMAND_DEFAULTS = {
  disabled: false,
  configurable: true,
};

export abstract class KauriCommand extends Command {
  constructor(id: string, options?: KauriCommandOptions) {
    super(id, options);

    this.defaults = Object.assign({}, COMMAND_DEFAULTS, options ? options.defaults : {});
    this.usage = options?.usage;
    this.userRoles = options?.userRoles;
    this.requiresDatabase = options?.requiresDatabase || false;
  }

  public afterCancel?(): any;
  public onBlocked?(message: Message): any;
  public interact?(interaction: any, args?: any): any;

  public help(message: Message): MessageEmbed {
    const prefix = (this.handler.prefix as PrefixSupplier)(message);

    const embed = new MessageEmbed()
      .setTitle(this.id)
      .setDescription(`Command prefix: \`${prefix}\`\nArguments: \`<required>\` | \`[optional]\``)
      .addFields({ name: '**Aliases**', value: this.aliases.map(a => `\`${a}\``).join(', ') });

    if (this.usage) {
      if (typeof this.usage === 'string') embed.addFields({ name: '**Usage**', value: `\`${prefix}${this.usage}\`` });
      else embed.addFields({ name: '**Usage**', value: this.usage.map(u => `\`${prefix}${u}\``).join('\n') });
    }

    return embed;
  }
}
