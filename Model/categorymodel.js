const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema ({
    category_id: { type: String },
    category_name: { type: String },
    category_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'usercollection' }],
    category_likers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'usercollection' }]
});

const CategoryCollection = mongoose.model("CategoryCollection", categorySchema);
module.exports = CategoryCollection;
