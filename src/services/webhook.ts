




// confirm payment then deliver value
const paymentWebhook = async (data) => {
    console.log("web hook processing is successful")
    // console.log(data)
    const { status } = data
    if (status.toLowerCase() == "successful") {
        
    }
    // check successful
    //store the details like tx_ref ,amount ,app_fee payment_method time
    // credit the persons wallet
}


export default paymentWebhook