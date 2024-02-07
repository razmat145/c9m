import { BaseConnection } from './Base';

import type { ConsumerConfig, Consumer, Kafka } from 'kafkajs';

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
      this.kafka = await this.opts.driver.Kafka.create({
        // brokers: this.opts?.brokers,
      });

      // TODO: config this
      this.consumer = this.kafka.consumer({ groupId: 'test-group' });

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
    //
  }

  public override async disconnect(): Promise<void> {
    this.opts.logger.debug('Disconnecting from Kafka broker..');

    await this.consumer.disconnect();

    this.opts.logger.debug('Disconnected from Kafka broker');
  }
}
