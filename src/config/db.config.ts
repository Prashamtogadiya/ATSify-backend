const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
    }catch(err:any){
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

export default connectDB;