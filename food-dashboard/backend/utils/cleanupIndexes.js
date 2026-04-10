const mongoose = require('mongoose');
require('dotenv').config();

const dropSettlementIdIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'settlements' }).toArray();
    
    if (collections.length > 0) {
      console.log('Dropping id_1 index from settlements collection...');
      try {
        await db.collection('settlements').dropIndex('id_1');
        console.log('Index id_1 dropped successfully');
      } catch (e) {
        console.log('Index id_1 not found, skipping');
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

dropSettlementIdIndex();
