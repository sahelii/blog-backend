require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

console.log('\n🔍 Database Connection Check\n');
console.log('='.repeat(50));

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env file');
  console.log('\n📝 Please create a .env file in blog-backend directory with:');
  console.log('MONGO_URI=your_mongodb_connection_string');
  console.log('\n💡 Format: mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority');
  console.log('⚠️  Get your connection string from MongoDB Atlas → Connect → Connect your application');
  process.exit(1);
}

// Mask password in connection string for display
const maskedUri = MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
console.log(`📡 Connection String: ${maskedUri}`);
console.log('='.repeat(50));
console.log('\n🔄 Attempting to connect to MongoDB...\n');

const startTime = Date.now();

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 5 second timeout
})
  .then(async () => {
    const connectionTime = Date.now() - startTime;
    
    console.log('✅ Database connection successful!\n');
    console.log('📊 Connection Details:');
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Connection Time: ${connectionTime}ms`);
    console.log(`   Ready State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // Test a simple query
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`\n📚 Collections in database: ${collections.length}`);
      if (collections.length > 0) {
        console.log('   Collections:', collections.map(c => c.name).join(', '));
      }
      
      // Count documents in main collections
      const Post = mongoose.connection.models.Post || mongoose.model('Post', new mongoose.Schema({}, { strict: false }));
      const User = mongoose.connection.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
      const Comment = mongoose.connection.models.Comment || mongoose.model('Comment', new mongoose.Schema({}, { strict: false }));
      
      try {
        const postCount = await Post.countDocuments();
        const userCount = await User.countDocuments();
        const commentCount = await Comment.countDocuments();
        
        console.log('\n📈 Document Counts:');
        console.log(`   Posts: ${postCount}`);
        console.log(`   Users: ${userCount}`);
        console.log(`   Comments: ${commentCount}`);
      } catch (err) {
        console.log('\n⚠️  Could not count documents (collections may not exist yet)');
      }
    } catch (err) {
      console.log('\n⚠️  Could not list collections:', err.message);
    }
    
    console.log('\n✅ Database is ACTIVE and ready to use!\n');
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    const connectionTime = Date.now() - startTime;
    
    console.error('❌ Database connection FAILED!\n');
    console.error('Error Details:');
    console.error(`   Message: ${err.message}`);
    console.error(`   Connection Time: ${connectionTime}ms`);
    console.error(`   Error Code: ${err.code || 'N/A'}`);
    
    console.log('\n🔧 Troubleshooting Tips:\n');
    
    if (err.message.includes('authentication failed') || err.message.includes('bad auth')) {
      console.log('💡 Authentication Error:');
      console.log('   - Check your username and password in the connection string');
      console.log('   - Verify credentials in MongoDB Atlas dashboard');
    } else if (err.message.includes('IP') || err.message.includes('whitelist')) {
      console.log('💡 IP Whitelist Error:');
      console.log('   - Your IP address is not whitelisted in MongoDB Atlas');
      console.log('   - Go to MongoDB Atlas → Network Access');
      console.log('   - Click "Add IP Address"');
      console.log('   - Add your current IP or use 0.0.0.0/0 for development');
    } else if (err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND')) {
      console.log('💡 Network Error:');
      console.log('   - Check your internet connection');
      console.log('   - Verify the cluster name in connection string');
      console.log('   - Office firewall may be blocking MongoDB ports');
      console.log('   - Try using MongoDB Atlas (cloud) instead of local MongoDB');
    } else if (err.message.includes('Invalid connection string') || err.message.includes('Invalid')) {
      console.log('💡 Connection String Format Error:');
      console.log('   - Check the format of your MONGO_URI');
      console.log('   - Format: mongodb+srv://username:password@cluster.mongodb.net/dbname');
    } else if (err.message.includes('timeout')) {
      console.log('💡 Connection Timeout:');
      console.log('   - Network may be slow or firewall blocking');
      console.log('   - Try again or check MongoDB Atlas cluster status');
    } else {
      console.log('💡 General Error:');
      console.log('   - Check MongoDB Atlas cluster status');
      console.log('   - Verify connection string is correct');
      console.log('   - Check network connectivity');
    }
    
    console.log('\n📝 Your connection string format should be:');
    console.log('MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority\n');
    console.log('⚠️  Never commit real credentials to Git! Use environment variables only.\n');
    
    process.exit(1);
  });
