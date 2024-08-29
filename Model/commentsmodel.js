const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReplySchema = new Schema({
    poll_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PollCollection' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'usercollection' },
    reply_msg: { type: String },
    likers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'usercollection' }],
    replies: [this]
}, { timestamps: true });

const CommentSchema = new Schema({
    poll_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PollCollection' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'usercollection' },
    comment: { type: String },
    created_at: { type: Date, default: Date.now },
    likers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'usercollection' }],
    replies: [ReplySchema]
}, { timestamps: true });



CommentSchema.pre('save', function(next) {
    const IST_OFFSET = 5.5 * 60 * 60 * 1000; 
    const currentIST = new Date(new Date().getTime() + IST_OFFSET);
    this.createdAt = currentIST;
    this.created_at = currentIST;
    this.updatedAt = currentIST;
    next();
});



ReplySchema.pre('save', function(next) {
    const IST_OFFSET = 5.5 * 60 * 60 * 1000; 
    const currentIST = new Date(new Date().getTime() + IST_OFFSET);
    this.createdAt = currentIST;
    this.created_at = currentIST;
    this.updatedAt = currentIST;
    next();
});

const CommentCollection = mongoose.model('commentscollection', CommentSchema);
module.exports = CommentCollection;