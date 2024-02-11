import type { BaseConnection } from './connection/Base';
import ConnectionFactory from './connection/Factory';

import { IBaseConnectionOpts, IHandlers } from './types';

interface WorkerBehaviour<TMessageType = Buffer> {
  onMessage(message: TMessageType, handlers?: IHandlers): Promise<void>;

  onMultiMessage(messages: TMessageType[]): Promise<void>;

  onError(error: Error): Promise<void>;
}

abstract class WorkerBehaviour<TMessageType> {
  protected connection: BaseConnection;

  constructor(protected opts: IBaseConnectionOpts) {}

  public async initialise(): Promise<void> {
    this.connection = await ConnectionFactory.createConnection(this.opts);

    await this.connection.connect();

    await this.connection.subscribe(
      this.opts.topic,
      async (message: Buffer, handlers?: IHandlers) => {
        // do parsing/casting to satisfy the type here if needed

        await this.onMessage(<TMessageType>message, handlers);
      }
    );
  }
}

export { WorkerBehaviour };
