import { EventEmitter } from 'events';

import { IBaseConnection, IDriverDependentSubscriptionOpts } from '../types';

const INITIAL_BACKOFF_DELAY = 1_000;
const MAX_BACKOFF_DELAY = 60_000;

export abstract class BaseConnection
  extends EventEmitter
  implements IBaseConnection
{
  private reconnectAttempts: number;
  private backoffDelay: number;

  constructor() {
    super();

    this.reconnectAttempts = 0;
    this.backoffDelay = INITIAL_BACKOFF_DELAY;
  }

  public abstract connect(): Promise<void>;

  public abstract disconnect(): Promise<void>;

  public abstract subscribe(
    topic: string,
    callback: (
      message: Buffer,
      handles?: { ack: Function; reject: Function }
    ) => Promise<void>
  ): Promise<void>;

  protected async reconnect(): Promise<void> {
    await this.disconnect();

    if (this.reconnectAttempts > 0) {
      await this.wait(this.backoffDelay);

      this.backoffDelay = Math.min(this.backoffDelay * 2, MAX_BACKOFF_DELAY);
    }
    this.reconnectAttempts++;

    await this.connect();
  }

  private wait(delay: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
