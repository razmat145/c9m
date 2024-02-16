# c9m

Consumerism aims to provide lightweight abstractions over most used message brokers in order to enabled quick prototyping.

Abstracting base connection handling comes with the loss of control but the ability of swapping out messaging drivers with minimal to no changes.

Compromises have to be made in order to provide a common interface for message consumption/production; but the aim is to keep respective broker terminology intact.

### Installing

```
npm install --save c9ms
```

### Usage

Given a naive `WorkerBehaviour` extension

```typescript
import { WorkerBehaviour } from 'c9ms';

class MyWorker extends WorkerBehaviour {
  public async onMessage(message: Buffer, handlers): Promise<void> {
    logger.info(`MyWorker Received message: ${message}`);

    // processing

    await handlers?.ack();
  }
}
```

Can then `npm install --save mqtt`  
And then be initialised to work with MQTT via e.g.

```typescript
const worker = new MyWorker({
  name: 'my-mqtt-consumer',
  protocol: 'mqtt',
  logger,
  host: 'localhost',
  port: 1883,
  username: 'user',
  password: 'pwd',
  topic: 'my-topic',
});

await worker.initialise();
```

Or `npm install --save kafkajs`  
And then be initialised to work with Kafka via e.g.

```typescript
const worker = new MyWorker({
  name: 'my-kafka-consumer',
  protocol: 'kafka',
  logger,
  host: 'localhost',
  port: 9093,
  username: 'user_kafka',
  password: 'secret',
  topic: 'my-topic',
});

await worker.initialise();
```

Or `npm install --save amqplib`  
And then be initialised to work with AMQP via e.g.

```typescript
const worker = new MyWorker({
  name: 'my-rabbit-consumer',
  protocol: 'amqp',
  logger,
  host: 'localhost',
  port: 5672,
  username: 'user',
  password: 'password',
  topic: 'my-queue',
});

await worker.initialise();
```

Note: the handling logic of the message never actually changed, only the initialisation config.

A producer can be initialised in the same way

```typescript
import { Producer } from 'c9ms';
```

MQTT e.g.

```typescript
const producer = new Producer({
  name: 'my-mqtt-producer',
  protocol: 'mqtt',
  logger,
  host: 'localhost',
  port: 1883,
  username: 'user',
  password: 'pwd',
  topic: 'my-topic',
});

await producer.initialise();

await producer.publish('my-topic', Buffer.from('Hello, World 1010102!'));
```

Kafka e.g.

```typescript
const producer = new Producer({
  protocol: 'kafka',
  name: 'my-kafka-producer',
  logger,
  host: 'localhost',
  port: 9093,
  username: 'user_kafka',
  password: 'secret',
  topic: 'my-topic',
});

await producer.initialise();

await producer.publish('my-topic', Buffer.from('Hello, World 1010102!'));
```

AMQP e.g.

```typescript
const producer = new Producer({
  name: 'my-amqp-producer',
  protocol: 'amqp',
  logger,
  host: 'localhost',
  port: 5672,
  username: 'user',
  password: 'password',
  topic: 'my-queue',
});

await producer.initialise();

await producer.publish('my-queue', Buffer.from('Hello, World 1010102!'));
```

### TODOs

A lot needs to be going on here :)

## License

This library is licensed under the Apache 2.0 License
