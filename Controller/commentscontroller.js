
const CommentCollection = require('../Model/commentsmodel');
const UserCollection = require('../Model/usermodel');

////create comment
exports.createComment = async (req, res) => {
    try {
        const { poll_id, user_id, comment } = req.body;

        const newComment = new CommentCollection({  poll_id, user_id, comment });
        await newComment.save();

        await UserCollection.findByIdAndUpdate(user_id, {
            $push: { commented_polls : newComment._id }
        });
        
        return res.status(201).json({ 
            comment: newComment,
            message: "Comment created successfully"
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/////create reply

exports.createReply = async (req, res) => {
    try {
        const { poll_id, user_id, reply_msg, comment_id } = req.body;
        const comment = await CommentCollection.findOne({_id : comment_id });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        const newReply = { poll_id, user_id, reply_msg };
        comment.replies.push(newReply);
        await comment.save();
        return res.status(201).json({ 
            reply: newReply,
            message: "Reply added successfully"
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/////////likecomment

exports.likeComment = async (req, res) => {
    try {
        const { user_id, comment_id } = req.body;
        const comment = await CommentCollection.findById({_id:comment_id});
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const userIndexInLikerArray = comment.likers.indexOf(user_id);

        if (userIndexInLikerArray === -1) {
            comment.likers.push(user_id);
            await comment.save();
            return res.status(200).json({ 
                message: "Comment liked ",
                comment
            });
        } else {
            comment.likers.splice(userIndexInLikerArray, 1);
            await comment.save();
            return res.status(200).json({ 
                message: "comment unlike",
                comment
            });
        }
    } catch (error) {
        console.error('Error toggling like on comment:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

//////likereply

exports.likeReply = async (req, res) => {
    try {
       
        const { user_id, comment_id, reply_id } = req.body;
        const comment = await CommentCollection.findOne({ _id : comment_id });
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        const reply = comment.replies.id(reply_id);
        
        const user_Index_in_liker_array = reply.likers.indexOf(user_id);

        if (!reply) {
            return res.status(404).json({ message: 'Reply not found' });
        }

        if (!reply.likers.includes(user_id)) {
            reply.likers.push(user_id);
            await comment.save();
            return res.status(200).json({ 
                message: "Reply liked successfully",
                reply
            });
        }

        if (user_Index_in_liker_array!== -1){
            reply.likers.splice(user_Index_in_liker_array, 1);
            await comment.save();
            return res.status(200).json({ 
            message: "Like removed successfully",
            reply   
            
        })
        }
       
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

////getCommentsByPollId
exports.getCommentsByPollId = async (req, res) => {
    try {
        const { poll_id } = req.body;
        const comments = await CommentCollection.find({ poll_id })
        .populate([
            { path: 'user_id', model: 'usercollection', select: 'user_name' },
            { path: 'replies.user_id', model: 'usercollection', select: 'user_name' }
        ]);

        if (!comments || comments.length === 0) {
            return res.status(404).json({ message: 'No comments found for this poll_id' });
        }

        return res.status(200).json(comments);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// exports.create = async(req,res,next)=>{
//     try
//     {
//     const {poll_id,user_id,reply_msg,likers,replies} = req.body;

//     const Doc = new SampleModel({poll_id,user_id,reply_msg,likers,replies});
//     await Doc.save();
    
//     return res.status(201).json({Message:"Commented",data:Doc})
//     }
//     catch(err)
//     {
//     return res.status(400).json({Message:err.message})
//     }

// }

// exports.getall = async(req,res,next)=> {
//     try{
//         const SampleDoc = await SampleModel.find({},{_id:0});
//         return res.status(200).json({data:SampleDoc})
//     }
//     catch(err){
//         return res.status(404).json({message:err.message})
//     }
// }

// exports.update = async (req,res,next)=>{
//     try{
//         const {id} = req.params;
//         const{poll_id,user_id,reply_msg,likers,replies} = req.body;

//         const updatedObject = {};

//         if(poll_id) updatedObject.poll_id = poll_id;
//         if(user_id) updatedObject.user_id = user_id;
//         if(reply_msg) updatedObject.reply_msg = reply_msg;
//         if(likers) updatedObject.likers = likers;
//         if(replies) updatedObject.replies = replies;
//         const updatedRecord = await SampleModel.findByIdAndUpdate(id,updatedObject, {new:true});

//         if(!updatedRecord){
//             return res.status(400).json({error:'Record not found'});
//         }
        
//         res.status(200).json({message:"Comment Updated ", data : updatedRecord})
        
//     }
//     catch(err){
//         return res.status(400).json({message:err.message});
//     }
// }

// exports.getbyid = async(req,res)=>{
//     try{
//     const {id} = req.params;

//     const data = await SampleModel.findById(id);
//     return res.status(200).json({data});       

//     }
//     catch(err){
//         return res.status(400).json({message:err.message});
//     }    
// }

// exports.remove = async(req,res)=>{
//     try{
//     const {id} = req.params;

//     const data = await SampleModel.findByIdAndDelete(id);
//     return res.status(200).json({Message:"Comment deleted "});       

//     }
//     catch(err){
//         return res.status(400).json({message:err.message});
//     }    
// }
