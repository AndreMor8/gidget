import mongoose from 'mongoose';
export default async function () {
    await mongoose.connect(process.env.MDB_PATH, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, user: process.env.MDB_USER, pass: process.env.MDB_PASS, dbName: process.env.MDB_DBNAME });
    console.log("Connected to the database");
    return true;
}