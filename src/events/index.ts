import emitter from './emitter';

const eventsMap = {
  'webhooks:coin:fund_crypto': ['transfer_coin'],
  'webhooks:cards:add_card': ['record_add_card_charge'],
  'webhooks:savings:record_card_charge': ['record_card_charge_savings'],
};

const setupEventListeners = async () => {
  try {
    for (const event in eventsMap) {
      const listeners = eventsMap[event];

      for await (const listener of listeners) {
        const eventHandler = (await import(`./listeners/${listener}`)).default;
        emitter.on(event, eventHandler);
      }
    }

    console.log(' 🎧  Event Listeners up and running  🎧  🎧 ');
  } catch (e) {
    console.error('event listeners setup failed ', e);
    process.exit(1);
  }
};

export default setupEventListeners;
