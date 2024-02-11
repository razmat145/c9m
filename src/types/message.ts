export interface IHandlers {
  ack: () => Promise<void>;
  reject: () => Promise<void>;
}
