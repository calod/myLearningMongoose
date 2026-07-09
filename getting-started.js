const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
    // 1. First, connect to your local MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/test');
    console.log("Connected successfully to local MongoDB!");

    // 2. Define the Schema (The blueprint)
    const kittySchema = new mongoose.Schema({
        name: String
    });

    // NOTE: methods must be added to the schema before compiling it with mongoose.model()
    kittySchema.methods.speak = function speak() {
        const greeting = this.name
            ? 'Meow name is ' + this.name
            : 'I don\'t have a name';
        console.log(greeting);
    };

    // 3. Compile the Schema into a Model (ONLY ONCE)
    const Kitten = mongoose.model('Kitten', kittySchema);

    // 4. Create a new document (Instance of the model SilenceCat)
    const silence = new Kitten({ name: 'Silence' });
    await silence.save();

    // 6. Create, test the method, and save the second cat (Fluffy)
    const fluffy = new Kitten({ name: 'fluffy' });
    fluffy.speak(); // "Meow name is fluffy"
    await fluffy.save();

    // 7. Find all kittens in the database and display them
    const kittens = await Kitten.find();
    console.log(kittens);

    // If we want to filter our kittens by name, Mongoose supports MongoDBs rich querying syntax.
    const filteredKittens = await Kitten.find({ name: /^fluff/ });

    // 5. Print it to your terminal to verify it works
    console.log("Your new kitten document object");
    console.log(silence.name); // Should print 'Silence'
    console.log("\nFiltered kittens (starting with fluff):");
    console.log(filteredKittens);
}