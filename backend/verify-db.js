import mongoose from "mongoose";
import fs from "fs";

const run = async () => {
    try {
        await mongoose.connect("mongodb+srv://srwshop41:srw1234@cluster0.liur6vj.mongodb.net/rewinding_shop?retryWrites=true&w=majority");
        const services = await mongoose.connection.db.collection('services').find().sort({createdAt: -1}).limit(2).toArray();
        fs.writeFileSync("db_output.json", JSON.stringify(services, null, 2));
        console.log("Written to db_output.json");
    } catch(err) {
        fs.writeFileSync("db_output.json", "ERROR: " + err.message);
    }
    process.exit(0);
}
run();
