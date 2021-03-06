import { join } from 'path';
import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { ClientOptions, Collection, GuildEmoji } from 'discord.js';
import { Connection } from 'mongoose';
import queue from 'p-queue';
import { Client as UrpgClient } from 'urpg.js';
import { InteractionHandler } from './commands/InteractionHandler';
import { ISettings, Settings } from '../models/mongo/settings';
import { db, instanceDB } from '../util/db';
import Logger from '../util/logger';

interface IKauriClient {
  commandHandler: CommandHandler;
  inhibitorHandler: InhibitorHandler;
  listenerHandler: ListenerHandler;
  logger: Logger;
  prefix: string;
  reactionQueue: queue;
  settings?: Collection<string, ISettings>;
  urpg: UrpgClient;

  db: {
    main: Connection;
    instance: Connection;
  };
}

declare module 'discord.js' {
  interface Client extends IKauriClient {}
}

export class KauriClient extends AkairoClient {
  public logger: Logger;
  public reactionQueue: queue;
  public settings?: Collection<string, ISettings>;

  public commandHandler: CommandHandler;
  public interactionHandler: InteractionHandler;
  public inhibitorHandler: InhibitorHandler;
  public listenerHandler: ListenerHandler;

  public urpg: UrpgClient;

  constructor(options: ClientOptions) {
    super({ ...options, ownerID: '122157285790187530' }, options);

    this.logger = new Logger(this);
    this.urpg = new UrpgClient({ nullHandling: true });

    this.db = {
      main: db,
      instance: instanceDB,
    };

    this.reactionQueue = new queue({
      concurrency: 1,
      autoStart: true,
      intervalCap: 1,
      interval: 100,
    });

    this.commandHandler = new CommandHandler(this, {
      argumentDefaults: { prompt: { time: 60000, cancel: 'Command cancelled' } },
      directory: join(__dirname, '..', 'commands'),
      commandUtil: true,
      commandUtilLifetime: 60000,
      fetchMembers: true,
      handleEdits: true,
      prefix: '!',
      storeMessages: true,
    });

    this.interactionHandler = new InteractionHandler(this, {
      directory: join(__dirname, '..', 'interactions'),
    });

    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: join(__dirname, '..', 'inhibitors'),
    });

    this.listenerHandler = new ListenerHandler(this, {
      directory: join(__dirname, '..', 'listeners'),
    });
  }

  public async start(): Promise<void> {
    await this.init();
    await this.login(process.env.KAURI_TOKEN).catch(e => this.logger.parseError(e));
  }

  private async init(): Promise<void> {
    this.settings = new Collection((await Settings.find()).map(s => [s.guild_id, s]));

    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
    this.commandHandler.useListenerHandler(this.listenerHandler);

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      websocket: this.ws,
    });

    this.interactionHandler.loadAll();
    this.commandHandler.loadAll();
    this.inhibitorHandler.loadAll();
    this.listenerHandler.loadAll();
  }

  public getTypeEmoji(type?: string, reverse = false): GuildEmoji | null {
    if (!type) return null;
    return this.emojis.cache.find(x => x.name === `type_${type.toLowerCase()}${reverse ? '_rev' : ''}`) ?? null;
  }
}
