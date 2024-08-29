const {Schema,model} = require('mongoose')

const sampleSchema = new Schema({

    user_name:{type:String},
    e_mail:{type:String},
    phno:{type:Number},
    dob:{type:String},
    gender:{type:String},
    password:{type:Number},
    age:{type:Number},

}) 

module.exports = model('usercollection',sampleSchema)






// const { Schema, model } = require('mongoose');

// const sampleSchema = new Schema({
//     user_name: {
//         type: String,
//         required: true,  // Makes this field mandatory
//         trim: true       // Removes any extra spaces
//     },
//     e_mail: {
//         type: String,
//         required: true,
//         unique: true,    // Ensures email is unique across documents
//         trim: true,
//         lowercase: true  // Converts email to lowercase
//     },
//     phno: {
//         type: Number,
//         required: true
//     },
//     dob: {               // Changed to lowercase for consistency
//         type: Date,      // Use Date type for date fields
//         required: true
//     },
//     gender: {
//         type: String,
//         enum: ['male', 'female', 'other'], // Restricts gender to specific values
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     age: {
//         type: Number,
//         required: true
//     }
// }, {
//     timestamps: true  // Adds createdAt and updatedAt fields
// });

// module.exports = model('User', sampleSchema);
