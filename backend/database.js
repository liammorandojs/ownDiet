const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true
});

let db = null;

const connectDB = async () => {
    if (db) return db;
    
    try {
        await client.connect();
        db = client.db('myowndiet');
        console.log('MongoDB connected successfully');
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

const getDB = () => {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return db;
};

const savedItemsCollection = () => getDB().collection('saved_items');

const getAll = async () => {
    const items = await savedItemsCollection()
        .find({})
        .project({ name: 1, type: 1, meal_type: 1, meal_count: 1, created_at: 1 })
        .sort({ created_at: -1 })
        .toArray();
    return items;
};

const getById = async (id) => {
    const { ObjectId } = require('mongodb');
    return await savedItemsCollection().findOne({ _id: new ObjectId(id) });
};

const getMeals = async () => {
    return await savedItemsCollection()
        .find({ type: 'meal' })
        .project({ name: 1, type: 1, meal_type: 1, meal_count: 1, created_at: 1 })
        .sort({ created_at: -1 })
        .toArray();
};

const getDays = async () => {
    return await savedItemsCollection()
        .find({ type: 'day' })
        .project({ name: 1, type: 1, meal_type: 1, meal_count: 1, created_at: 1 })
        .sort({ created_at: -1 })
        .toArray();
};

const create = async (name, type, mealType, mealCount, data) => {
    const result = await savedItemsCollection().insertOne({
        name,
        type,
        meal_type: mealType,
        meal_count: mealCount,
        data,
        created_at: new Date()
    });
    return { id: result.insertedId.toString(), name, type, meal_type: mealType, meal_count: mealCount };
};

const remove = async (id) => {
    const { ObjectId } = require('mongodb');
    const result = await savedItemsCollection().deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
};

module.exports = {
    connectDB,
    getDB,
    getAll,
    getById,
    getMeals,
    getDays,
    create,
    remove
};
