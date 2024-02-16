import type { BaseConnection } from './connection/Base';
import ConnectionFactory from './connection/Factory';

import { IBaseConnectionOpts } from './types';

export class Producer {
  protected connection: BaseConnection;

  constructor(protected opts: IBaseConnectionOpts) {}

  public async initialise(): Promise<void> {
    this.connection = await ConnectionFactory.createConnection(this.opts);

    await this.connection.connect();
  }

  public async publish(topic: string, message: Buffer): Promise<void> {
    await this.connection.publish(topic, message);
  }
}
