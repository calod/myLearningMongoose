const mongoose = require('mongoose');
// import mongoose from 'mongoose';

main().catch(err => console.log(err));

async function main() {
    // 1. First, connect to your local MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/test');
    console.log("Connected successfully to local MongoDB!");

    // 2. Define the Schema (The blueprint)
    // const { Schema } = mongoose;   If I declare this variable to the top of the file
    // const kittySchema = new Schema({})
    const kittySchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'A kitten must have a name!'] // Required validation
        },
        age: {
            type: Number,                      // Let's add an age field to practice numeric queries
            min: [0, 'Age cannot be negative'] // Numeric validation
        },
        createdAt: { type: Date, default: Date.now }
    });
    // Adding an instance method .speak()
    // NOTE: methods must be added to the schema before compiling it with mongoose.model()
    kittySchema.methods.speak = function speak() {
        const greeting = this.name
            ? 'Meow name is ' + this.name
            : 'I don\'t have a name';
        console.log(greeting);
    };
    // Instance Method: Applied to an individual kitten instance
    kittySchema.methods.speak = function speak() {
        console.log(this.name ? `Meow name is ${this.name}` : "I don't have a name");
    };

    // 🔥 NEW: Static Method - Applied to the whole Kitten collection
    // kittySchema.statics.findByNameKeyword = function (keyword) {
    //     // 'this' refers to the Kitten Model itself here
    //     return this.find({ name: new RegExp(keyword, 'i') });
    // };

    // Update the Static Method Definition near the top of your file:
    kittySchema.statics.findByMultipleKeywords = function (keywordsArray) {
        // Maps ['flu', 'silen'] into [{name: /flu/i}, {name: /silen/i}]
        const conditions = keywordsArray.map(keyword => ({
            name: new RegExp(keyword, 'i')
        }));

        // Runs a MongoDB $or query
        return this.find({ $or: conditions });
    };

    // 3. Compile the Schema into a Model (ONLY ONCE)
    const Kitten = mongoose.model('Kitten', kittySchema);

    // FIX THE DUPLICATION: Clear the collection before doing anything else
    await Kitten.deleteMany({});
    console.log("Database cleared for a clean test run.");

    // 4. Create and Save instances
    const silence = new Kitten({ name: 'Silence', age: 3 });
    silence.speak(); //"Meow name is silence"
    await silence.save();

    const fluffy = new Kitten({ name: 'fluffy', age: 5 });
    fluffy.speak(); // "Meow name is fluffy"
    await fluffy.save();

    // 5. PRACTICE: Let's trigger a Validation Error on purpose
    try {
        const brokenKitten = new Kitten({ age: -2 }); // Missing name and Negative age
        await brokenKitten.save();
    } catch (error) {
        console.log("\n❌ Validation Failed as Expected");
        console.log(error.message);
    }
    // 6. PRACTICE: Update an existing document
    // Let's find "fluffy" and make him 1 year older
    await Kitten.updateOne({ name: 'fluffy' }, { $inc: { age: 1 } });
    console.log("\n🔄 fluffy had a birthday!");

    // 7. Find all kittens in the database and display them
    console.log("\n--- Final Kittens in DB ---");
    const kittens = await Kitten.find();
    console.log(kittens);

    // 7. PRACTICE: Using our new Custom Static Method
    // console.log("\n--- Searching using Custom Static Method ---");
    // const searchResults = await Kitten.findByNameKeyword('flu');
    // console.log(searchResults);

    // This tells the regex: Look for "flu" OR "silen"
    // const searchResults = await Kitten.findByNameKeyword('flu|silen');
    // console.log("Searching by keywords", searchResults);

    // Find by Multiple Keywords
    const searchResults = await Kitten.findByMultipleKeywords(['flu', 'silen']);
    console.log("Searching by Multiple keywords", searchResults);

    // This performs a search for all documents with a name property that begins with "fluff" and returns the result as an array of kittens.
    const searchfluff = await Kitten.find({ name: /^fluff/ });
    console.log("Searching for names that starts with fluff", searchfluff);

    // Cleanlly close connection so the terminal exits
    await mongoose.disconnect();

}