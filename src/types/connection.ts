export interface IBaseConnection {
  connect(): Promise<void>;

  disconnect(): Promise<void>;

  subscribe<T extends IDriverDependentSubscriptionOpts>(
    topic: string,
    callback: (
      message: Buffer,
      handles: { ack: Function; reject: Function }
    ) => Promise<void>,
    opts: T
  ): Promise<void>;
}

export interface IBaseConnectionOpts {
  // TODO: attempt to type dynamic driver
  driver?: any;

  topic?: string;

  protocol: 'amqp' | 'mqtt' | 'kafka';

  host: string;

  port: number;

  username?: string;

  password?: string;

  logger?: ILogger;
}

export interface ILogger {
  info(message: string): void;

  error(message: string): void;

  warn(message: string): void;

  debug(message: string): void;
}

export interface IDriverDependentSubscriptionOpts {
  //
}
