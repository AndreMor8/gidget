import mongoose from 'mongoose';

export default async function () {
  await mongoose.connect(process.env.MDB_PATH);
  console.log("Connected to the database");
  return true;
}