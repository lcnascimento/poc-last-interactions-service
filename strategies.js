const { gzip } = require('node-gzip');
const snappy = require('snappy');
const lzo = require('lzo');

module.exports.hashAndSortedSetNoCompression = (pipeline, events) => {
  events.forEach(event => {
    const HASH_KEY = `events:${event.message_id}`
    const SORTED_SET_KEY = `reference:${event.reference}:${event.action}`
  
    pipeline.hmset(
      HASH_KEY,
      {
        "message_id": event.message_id,
        "reference": event.reference,
        "action": event.action,
        "app_key": event.api_key,
        "type": event.type,
        "timestamp": event.timestamp,
        "received_at": event.received_at,
      },
    )

    pipeline.expire(HASH_KEY, 86400) // 1 day
  
    pipeline.zadd(
      SORTED_SET_KEY,
      new Date(event.timestamp).getTime(),
      HASH_KEY,
    )

    pipeline.expire(SORTED_SET_KEY, 86400) // 1 day
  });

  return pipeline;
}

module.exports.SortedSetNoCompression = (pipeline, events) => {
  events.forEach(event => {
    const SORTED_SET_KEY = `reference:${event.reference}:${event.action}`

    const props = {
      "message_id": event.message_id,
      "reference": event.reference,
      "action": event.action,
      "app_key": event.api_key,
      "type": event.type,
      "timestamp": event.timestamp,
      "received_at": event.received_at,
    }

    pipeline.zadd(
      SORTED_SET_KEY,
      new Date(event.timestamp).getTime(),
      JSON.stringify(props).toString('base64'),
    )

    pipeline.expire(SORTED_SET_KEY, 86400) // 1 day
  });

  return pipeline;
}

module.exports.SortedSetGzipFull = async (pipeline, events) => {
  for (let i = 0; i < events.length; i++) {
    let event = events[i];

    const SORTED_SET_KEY = `reference:${event.reference}:${event.action}`;

    data = await gzip(JSON.stringify(event));

    pipeline.zadd(
      SORTED_SET_KEY,
      new Date(event.timestamp).getTime(),
      data.toString('base64'),
    )

    pipeline.expire(SORTED_SET_KEY, 86400) // 1 day
  }

  return pipeline;
}

module.exports.SortedSetGzipPartial = async (pipeline, events) => {
  for (let i = 0; i < events.length; i++) {
    let event = events[i];

    const SORTED_SET_KEY = `reference:${event.reference}:${event.action}`;

    data = await gzip(JSON.stringify({
      "message_id": event.message_id,
      "reference": event.reference,
      "action": event.action,
      "app_key": event.api_key,
      "type": event.type,
      "timestamp": event.timestamp,
      "received_at": event.received_at,
    }));

    pipeline.zadd(
      SORTED_SET_KEY,
      new Date(event.timestamp).getTime(),
      data.toString('base64'),
    )

    pipeline.expire(SORTED_SET_KEY, 86400) // 1 day
  }

  return pipeline;
}

module.exports.SortedSetSnappyPartial = async (pipeline, events) => {
  for (let i = 0; i < events.length; i++) {
    let event = events[i];

    const SORTED_SET_KEY = `reference:${event.reference}:${event.action}`;

    const payload = JSON.stringify({
      "message_id": event.message_id,
      "reference": event.reference,
      "action": event.action,
      "app_key": event.api_key,
      "type": event.type,
      "timestamp": event.timestamp,
      "received_at": event.received_at,
    });
    
    const data = await new Promise((res) => snappy.compress(payload, (_, d) => res(d)));

    pipeline.zadd(
      SORTED_SET_KEY,
      new Date(event.timestamp).getTime(),
      data.toString('base64'),
    )

    pipeline.expire(SORTED_SET_KEY, 86400) // 1 day
  }

  return pipeline;
}

module.exports.SortedSetLZOPartial = async (pipeline, events) => {
  for (let i = 0; i < events.length; i++) {
    let event = events[i];

    const SORTED_SET_KEY = `reference:${event.reference}:${event.action}`;

    const payload = JSON.stringify({
      "message_id": event.message_id,
      "reference": event.reference,
      "action": event.action,
      "app_key": event.api_key,
      "type": event.type,
      "timestamp": event.timestamp,
      "received_at": event.received_at,
    });
    
    const data = lzo.compress(payload); //await new Promise((res) => snappy.compress(payload, (_, d) => res(d)));

    pipeline.zadd(
      SORTED_SET_KEY,
      new Date(event.timestamp).getTime(),
      data.toString('base64'),
    )

    pipeline.expire(SORTED_SET_KEY, 86400) // 1 day
  }

  return pipeline;
}
