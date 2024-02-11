import { BaseConnection } from './Base';

import type { Connection, Channel } from 'amqplib';

import {
  IBaseConnectionOpts,
  IDriverDependentSubscriptionOpts,
  IHandlers,
} from '../types';

export class AMQPConnection extends BaseConnection {
  private channel: Channel;
  private connection: Connection;

  constructor(protected opts: IBaseConnectionOpts) {
    super();
  }

  public override async connect(): Promise<void> {
    try {
      this.opts.logger.debug('Connecting to AMQP broker..');
      this.connection = await this.opts.driver.connect({
        protocol: 'amqp',
        hostname: this.opts.host,
        port: this.opts.port,
        username: this.opts.username,
        password: this.opts.password,
      });

      this.channel = await this.connection.createChannel();
      this.opts.logger.debug('Connected to AMQP broker');

      this.attachListeners();
    } catch (err) {
      this.opts.logger.error(`AMQP connection error: ${err.message}`);

      await this.reconnect();
    }
  }

  public override async subscribe<T extends IDriverDependentSubscriptionOpts>(
    topic: string,
    callback: (message: Buffer, handles?: IHandlers) => Promise<void>,
    subscriptionOpts?: T
  ): Promise<void> {
    // TODO: implement auto-bind to exchange
    // based on subscriptionOpts
    await this.channel.assertQueue(topic);

    await this.channel.consume(topic, async (msg) => {
      if (msg) {
        await callback(msg.content, {
          ack: async () => {
            await this.channel.ack(msg);
          },
          reject: async () => {
            await this.channel.reject(msg, false);
          },
        });
      }
    });
  }

  private attachListeners(): void {
    this.channel.on('error', async (err) => {
      this.opts.logger.error(`AMQP channel error: ${err.message}`);

      await this.reconnect();
    });

    this.connection.on('error', async (err) => {
      this.opts.logger.error(`AMQP connection error: ${err.message}`);

      await this.reconnect();
    });
  }

  public override async disconnect(): Promise<void> {
    this.opts.logger.debug('Disconnecting from AMQP broker..');
    await this.channel.close();

    await this.connection.close();
    this.opts.logger.debug('Disconnected from AMQP broker');
  }
}
