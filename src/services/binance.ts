
const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: process.env.BINANCE_KEY,
    APISECRET: process.env.BINANCE_SECRET,
});

/* const transferCoin = async (data) => {
    console.log("Transfering coin")
    const { address, amount } = data
    await binance.withdraw("USDT", address, amount)
    
    
     
}
*/
const transferCoin = async() => {
    await binance.withdrawHistory((error, response) => {
        console.info(response);
      }, "USDT");
}

export default transferCoin