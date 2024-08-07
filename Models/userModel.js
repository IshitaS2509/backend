// // const mongoose = require('mongoose');

// // const userSchema = new mongoose.Schema({
// //     name: { type: String, required: true },
// //     email: { type: String, required: true, unique: true },
// //     password: { type: String, required: true },
// //     age: { type: Number },
// //     height: { type: Number },
// //     weight: { type: Number },
// //     weightGoal: { type: String, enum: ['gain', 'lose'] }
// // });

// // const User = mongoose.models.User ||mongoose.model('User', userSchema);

// // module.exports = User;

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const UserSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     age: Number,
//     height: Number,
//     weight: Number,
//     weightGoal: { type: String, enum: ['gain', 'lose'] }
// });

// UserSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         return next();
//     }

//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });

// module.exports = mongoose.model('User', UserSchema);

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },  // Store plain text password
    age: Number,
    height: Number,
    weight: Number,
    weightGoal: { type: String, enum: ['gain', 'lose'] }
});

module.exports = mongoose.models.User ||mongoose.model('User', UserSchema);