

module.exports.setUp = async () => {
};

module.exports.dropDatabase = async () => {




 }
};

module.exports.dropCollections = async () => {
 if (mongo) {
     const collections = mongoose.connection.collections;

     for (const key in collections) {
         const collection = collections[key];
         await collection.deleteMany();
     }
 }
}
