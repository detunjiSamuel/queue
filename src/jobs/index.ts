import { dailyCronQueue, weeklyCronQueue, monthlyCronQueue } from "../config/bull";
import { processAutosaving } from "../services/savings.service";



const handleCron = async (job, done) => {
    console.log("Re", job.data.msg);
    done();
    try {
        console.log(`${job.data.msg} :  occuring`)
        await processAutosaving(job.data.msg)
        done()
    } catch (e) {
        console.log(e.message)
        done(new Error(`Flw webhook processing failed`));
    }
}

dailyCronQueue.process(handleCron)
weeklyCronQueue.process(handleCron)
monthlyCronQueue.process(handleCron)



// https://optimalbits.github.io/bull/

//  https://crontab.guru/every-day-8am
dailyCronQueue.add({ msg: 'daily' }, { repeat: { cron: '0 8 * * *' } })
weeklyCronQueue.add({ msg: 'weekly' }, { repeat: { cron: '0 0 * * 0' } })
monthlyCronQueue.add({ msg: 'monthly' }, { repeat: { cron: '0 0 1 * *' } })





