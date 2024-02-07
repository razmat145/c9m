import type { BaseConnection } from './connection/Base';
import ConnectionFactory from './connection/Factory';

import { IBaseConnectionOpts } from './types';

interface WorkerBehaviour<TMessageType = Buffer> {
  onMessage(message: TMessageType): Promise<void>;

  onMultiMessage(messages: TMessageType[]): Promise<void>;

  onError(error: Error): Promise<void>;
}

abstract class WorkerBehaviour<TMessageType> {
  protected connection: BaseConnection;

  constructor(protected opts: IBaseConnectionOpts) {}

  public async initialise(): Promise<void> {
    this.connection = await ConnectionFactory.createConnection(this.opts);

    console.error('whyyy');
    await this.connection.connect();
    console.error('def not here hopeFully');
    await this.connection.subscribe(
      this.opts.topic,
      async (message: Buffer) => {
        // do parsing/casting to satisfy the type here if needed

        await this.onMessage(<TMessageType>message);
      }
    );
  }
}

export { WorkerBehaviour };
