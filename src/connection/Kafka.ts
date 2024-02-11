import { BaseConnection } from './Base';

import type { Consumer, Kafka, logLevel } from 'kafkajs';

import {
  IBaseConnectionOpts,
  IDriverDependentSubscriptionOpts,
} from '../types';

export class KafkaConnection extends BaseConnection {
  private consumer: Consumer;

  private kafka: Kafka;

  constructor(protected opts: IBaseConnectionOpts) {
    super();
  }

  public override async connect(): Promise<void> {
    try {
      this.kafka = new this.opts.driver.Kafka({
        brokers: [`${this.opts.host}:${this.opts.port}`],
        logLevel: 0,
        // sasl: {
        //   mechanism: 'plain',
        //   username: this.opts.username,
        //   password: this.opts.password,
        // },
      });

      this.consumer = this.kafka.consumer({ groupId: this.opts.name });

      await this.consumer.connect();

      this.attachListeners();
    } catch (err) {
      this.opts.logger.error(`Kafka connection error: ${err.message}`);

      await this.reconnect();
    }
  }

  private attachListeners(): void {
    this.kafka.logger().error('Kafka connection error', async (error) => {
      this.opts.logger.error(`Kafka connection error: ${error.message}`);

      await this.reconnect();
    });
    this.consumer.on('consumer.crash', async (event) => {
      this.opts.logger.error(`Kafka consumer error: ${event.toString()}`);

      await this.reconnect();
    });
  }

  public override async subscribe<T extends IDriverDependentSubscriptionOpts>(
    topic: string,
    callback: (
      message: Buffer,
      handles?: { ack: Function; reject: Function }
    ) => Promise<void>,
    subscriptionOpts?: T
  ): Promise<void> {
    try {
      await this.consumer.subscribe({ topic });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          await callback(message.value as Buffer, {
            ack: () => {
              this.consumer.commitOffsets([
                { topic, partition, offset: message.offset },
              ]);
            },
            reject: () => {
              this.consumer.commitOffsets([
                { topic, partition, offset: message.offset },
              ]);
              // TODO:
              // this.consumer.seek({ topic, partition, offset: message.offset });
            },
          });
        },
      });
    } catch (err) {
      this.opts.logger.error(`Kafka subscription error: ${err.message}`);
    }
  }

  public override async disconnect(): Promise<void> {
    this.opts.logger.debug('Disconnecting from Kafka broker..');

    await this.consumer.disconnect();

    this.opts.logger.debug('Disconnected from Kafka broker');
  }
}
