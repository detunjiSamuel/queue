
import mongoose from 'mongoose'
import config from '.'

export default async () => {
    await mongoose.connect(config.databaseUrl, async () => {
        console.log("db started")
        // to add run seed here
    })
}

