require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env file');
  console.log('\nPlease create a .env file with:');
  console.log('MONGO_URI=your_mongodb_connection_string');
  process.exit(1);
}

console.log('🔄 Attempting to connect to MongoDB...');
console.log(`Connection string: ${MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Database connected successfully!');
    console.log(`Connected to: ${mongoose.connection.host}`);
    console.log(`Database: ${mongoose.connection.name}`);
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Database connection failed!');
    console.error('\nError details:');
    console.error(err.message);
    
    if (err.message.includes('authentication failed')) {
      console.log('\n💡 Tip: Check your username and password in the connection string');
    } else if (err.message.includes('IP')) {
      console.log('\n💡 Tip: Your IP address may not be whitelisted in MongoDB Atlas');
      console.log('   Go to Network Access in Atlas and add your IP');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Tip: MongoDB server is not running or connection string is wrong');
    } else if (err.message.includes('Invalid connection string')) {
      console.log('\n💡 Tip: Check the format of your MONGO_URI');
      console.log('   Format: mongodb+srv://username:password@cluster.mongodb.net/dbname');
    }
    
    process.exit(1);
  });
