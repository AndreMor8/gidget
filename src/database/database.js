import mongoose from 'mongoose';
mongoose.set('useFindAndModify', false);
export default async function () {
    await mongoose.connect(process.env.MDB_PATH, { useNewUrlParser: true, useUnifiedTopology: true, user: process.env.MDB_USER, pass: process.env.MDB_PASS, dbName: process.env.MDB_DBNAME });
    console.log("Connected to the database");
    return true;
}