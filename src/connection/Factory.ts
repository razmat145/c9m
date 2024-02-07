import { MQTTConnection } from './MQTT';
import { AMQPConnection } from './AMQP';
import { KafkaConnection } from './Kafka';

import { BaseConnection } from './Base';

import { IBaseConnectionOpts, PROTOCOL_DRIVER_MAP } from '../types';

class ConnectionFactory {
  public async createConnection(
    opts: IBaseConnectionOpts
  ): Promise<BaseConnection> {
    const { protocol } = opts;
    const driver = await this.importDriver(opts, protocol);

    switch (protocol) {
      case 'mqtt':
        return new MQTTConnection(Object.assign(opts, { driver }));
      case 'amqp':
        return new AMQPConnection(Object.assign(opts, { driver }));
      case 'kafka':
        return new KafkaConnection(Object.assign(opts, { driver }));
      default:
        opts.logger.error(
          `Unknown or not yet implemented protocol ${protocol}`
        );
        throw new Error(`Unknown or not yet implemented protocol ${protocol}`);
    }
  }

  // TODO: define a generic driver type
  private async importDriver(
    opts: IBaseConnectionOpts,
    protocol: string
  ): Promise<any> {
    try {
      opts.logger.debug(`Importing driver for protocol ${protocol}`);
      return await import(PROTOCOL_DRIVER_MAP[protocol]);
    } catch (err) {
      opts.logger.error(
        `Error importing driver for protocol ${protocol}: ${err.message}; Please make sure to install ${PROTOCOL_DRIVER_MAP[protocol]} package before use`
      );
      throw new Error(
        `Error importing driver for protocol ${protocol}: ${err.message}; Please make sure to install ${PROTOCOL_DRIVER_MAP[protocol]} package before use`
      );
    }
  }
}

export default new ConnectionFactory();
