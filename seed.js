const fs = require('fs');
const readline = require('readline');
const faker = require('faker');
const Redis = require('ioredis');

const strategies = require('./strategies');

const EVENTS_QTD = Number(process.argv[2]) || 10000

const client = new Redis();

const handleEvent = (event, it) => {
  return Object.assign({}, event, {
    message_id: `${it}${event.message_id || faker.random.alphaNumeric(40)}`,
    reference: `${it}${event.reference || faker.random.alphaNumeric(16)}`,
  });
}

const getBulk = (it) => {
  return new Promise((res) => {
    const events = [];

    const readInterface = readline.createInterface({
      input: fs.createReadStream('events'),
      console: false
    });
    
    readInterface.on('line', (line) => {
      let event = handleEvent(JSON.parse(line), it);
      events.push(event);
    });

    readInterface.on('close', () => res(events));
  })
}

const main = async () => {
  for (let i = 0; i < EVENTS_QTD / 10000; i++) {
    const bulk = await getBulk(i);
    const pipeline = await strategies.SortedSetLZOPartial(client.pipeline(), bulk);
    await pipeline.exec();

    console.log(`Bulk ${i}/${Math.floor(EVENTS_QTD / 10000) - 1} inserted successfuly!`);
  }
  
  client.disconnect();
};

main();
