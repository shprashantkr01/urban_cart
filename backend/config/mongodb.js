//Moongoose is an ODM(Object Data Modelling) Library in Node.js
//Provides Structured schema based way of interacting with the MongoDB database.
import mongoose from "mongoose";

const connectDB = async () => { // Defines an Asynchronus function connectDB that will handle connecting databse.

    mongoose.connection.on('connected',() => {//Sets up an event listener when connected it logs db connected.
        console.log("DB Connected");
    })

    await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`)

}

export default connectDB;