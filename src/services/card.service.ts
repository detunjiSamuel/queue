
import { chargeWithToken } from "./flutterwave.service"






export const chargeQueueHandler = async (job, done) => {
    const { payload } = job.data

    try {
        console.log('chargeQueue', 'sending payload')
        await chargeWithToken(payload)
        done()
    } catch (e) {
        done(new Error(`send mail failed- ${payload.subject}`));
    }
}