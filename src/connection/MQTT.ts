import type { MqttClient } from 'mqtt';

import { BaseConnection } from './Base';

import {
  IBaseConnectionOpts,
} from '../types';

export class MQTTConnection extends BaseConnection {
  protected client: MqttClient;

  constructor(protected opts: IBaseConnectionOpts) {
    super();
  }

  public override async connect(): Promise<void> {
    this.opts.logger.debug('Connecting to MQTT broker..');

    this.client = await this.opts.driver.connectAsync({
      protocol: 'mqtt',
      host: this.opts.host,
      port: this.opts.port,
      username: this.opts.username,
      password: this.opts.password,
      // TODO: handle this with backoff
      reconnectPeriod: 0,
    });
    this.opts.logger.debug('Connected to MQTT broker');

    this.attachListeners();
  }

  public override async subscribe(
    topic: string,
    callback: (
      message: Buffer,
      handles?: { ack: Function; reject: Function }
    ) => Promise<void>
  ): Promise<void> {
    this.opts.logger.debug(`Subscribing to topic: ${topic}`);
    this.client.on('message', async (topic, message) => {
      await callback(message);
    });

    await this.client.subscribeAsync(topic, {
      qos: 2,
    });
    this.opts.logger.debug(`Subscribed to topic: ${topic}`);
  }

  private attachListeners(): void {
    this.client.on('error', async (err) => {
      this.opts.logger.error(`MQTT client error: ${err.message}`);

      await this.reconnect();
    });
  }

  public override async disconnect(): Promise<void> {
    this.opts.logger.debug('Disconnecting from MQTT broker..');
    await this.client.endAsync(true);
    this.opts.logger.debug('Disconnected from MQTT broker');
  }
}
