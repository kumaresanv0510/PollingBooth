const mongoose = require('mongoose')
const Schema= mongoose.Schema
const pollCollectionSchema = new Schema({
        date: { type: Date},
        poll_id: { type: String},
        question: { type: String},
        options: [{
            pic: { type: String },
            option: { type: String},
            count: { type: Number, default: 0 },
            voters:[{ type: mongoose.Schema.Types.ObjectId, ref: 'usercollection' }]
        }],
        isActive: { type: Boolean, default: true },
        status: { type: String, enum: ['open', 'closed'], default: 'open' },
        title: { type: String },
        desc: { type: String },
        category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'categorycollection' }],
        expirationTime: { type: Date }, 
        winner: { type: String }, 
        likers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'usercollection' }],
        voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'usercollection' }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'usercollection'},
        total_votes: { type: Number, default: 0 },
        total_likes: { type: Number, default: 0 },
        comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'commentscollection' }]
    }, 
    { timestamps: true }
    );
    pollCollectionSchema.pre('save', function(next) {
        const IST_OFFSET = 5.5 * 60 * 60 * 1000; 
        const currentIST = new Date(new Date().getTime() + IST_OFFSET);
        this.createdAt = currentIST;
        this.updatedAt = currentIST;
        next();
    });
    
const PollCollection = mongoose.model('PollCollection', pollCollectionSchema);
module.exports = PollCollection;