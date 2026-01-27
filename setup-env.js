const fs = require('fs');
const path = require('path');

const envContent = `PORT=5000
MONGO_URI=mongodb+srv://saheli:saheli12345@cluster0.fty5s.mongodb.net/blogDB?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=mysupersecretkey
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env');

try {
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists!');
    console.log('📄 Current content:');
    console.log(fs.readFileSync(envPath, 'utf8'));
    console.log('\n💡 If you want to update it, delete the existing .env file first.');
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('📄 Location:', envPath);
    console.log('\n📝 Contents:');
    console.log(envContent);
  }
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\n📝 Please create .env file manually with:');
  console.log(envContent);
}
