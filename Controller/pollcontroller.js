const PollCollection = require('../Model/pollmodel');
const CommentCollection= require('../Model/commentsmodel');
const CategoryCollection = require('../Model/categorymodel')
const UserCollection = require('../Model/usermodel')

////Get all polls

exports.getallpolls = async (req, res) => {
    try {
        const polls = await PollCollection.find({})
            .populate({
                path: 'category',
                select: '_id category_name' 
            })
            .populate({
                path: 'createdBy',
                select: '_id user_name user_profile' 
            })
            .populate({
                path: 'likers',
                select: '_id user_name user_type' 
            })  
            .populate({
                path: 'voters',
                select: '_id user_name user_type' 
            })
            .populate({
                path: 'comments',
                populate: {
                    path: 'user_id',
                    select: '_id user_name' 
                }
            })
            .sort({ 
                status: -1, 
                createdAt: -1 
            });

        const pollsWithComments = [];

        for (let poll of polls) {
            const comments = await CommentCollection.find({ poll_id: poll._id })
                .populate('user_id', 'user_name')
                .lean();

            const combinedData = {
                _id: poll._id,
                created_date: poll.created_date,
                poll_id: poll.poll_id,
                title: poll.title,
                category: poll.category,
                question: poll.question,
                options: poll.options,
                status: poll.status,
                createdBy: poll.createdBy,
                likers: poll.likers,
                voters: poll.voters,
                isActive: poll.isActive,
                winner: poll.winner,
                expirationTime: poll.expirationTime,
                comments: comments,
                createdAt: poll.createdAt
            };        
            pollsWithComments.push(combinedData);
        }
        return res.status(200).json(pollsWithComments);
    } catch (error) {
        console.error('Error fetching polls:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } 
};

/////updadte poll

exports.updatepoll = async (req, res,next) => {
    const { question, options, duration, poll_id } = req.body;

    try {
        const createdAt = new Date(new Date().getTime() +5.5 * 60 * 60 * 1000);
        const expirationTime = new Date(createdAt.getTime() + duration * 60 * 60 * 1000);
        const pollToUpdate = await PollCollection.findOne({_id : poll_id});
        if (pollToUpdate) {
                pollToUpdate.question = question || pollToUpdate.question;
                pollToUpdate.options = options || pollToUpdate.options;
                pollToUpdate.expirationTime = expirationTime || pollToUpdate.expirationTime;
                await pollToUpdate.save();
                res.json({ message: 'Poll updated successfully' });
            
        } else {
            res.status(404).json({ message: 'No polls found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
///createpoll

exports.createpoll = async (req, res,next) => {
    const {question, options, duration, title, desc, category, createdBy } = req.body;
    try {
        const user = await UserCollection.findOne({_id: createdBy });
        if (!user) {
            return res.status(404).json({ message: "Invalid user" });
        }
        
            const createdAt = new Date(new Date().getTime() +  5.5 * 60 * 60 * 1000);
            const expirationTime = new Date(createdAt.getTime() + duration * 60 * 60 * 1000);
            const newPollCollection = new PollCollection({
                question,
                options,
                title,
                desc,
                category,
                expirationTime,
                createdBy 
             });
            const savedPoll= await newPollCollection.save();

            await CategoryCollection.findByIdAndUpdate( category, {
                $push: { category_users :newPollCollection.createdBy  }
            });
    
            await UserCollection.findByIdAndUpdate( createdBy, {
                $push: {  user_used_category :newPollCollection.category  }
            });
    
            await UserCollection.findByIdAndUpdate(createdBy, {
                $push: { created_polls: newPollCollection._id }
            });
            const populatedPoll = await PollCollection.findById(savedPoll.poll_id)
            .populate(
            'createdBy', 
            'user_id user_name e_mail phono joined_date') 
            .populate('category', 'category_id category_name'); 
        
            res.status(201).json(populatedPoll);
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

///delete poll

exports.deletepoll = async (req, res, next) => {
  
    const {poll_id} = req.body;

    try {
        const pollCollection = await PollCollection.findOne({_id:poll_id});
        if (pollCollection) {
                await pollCollection.deleteOne();
                res.json({ message: 'Poll deleted successfully' });
                } 
        else {
            res.status(404).json({ message: 'No polls found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

////likeonpoll

exports.likeOnPoll = async (req, res) => {
    const { poll_id } = req.body;
    const { user_id } = req.body; 
    const user = user_id;
    try {     
        const poll = await PollCollection.findOne({ _id: poll_id });
        if (!poll)   return res.status(404).json({ error: 'Poll not found' });

        const user_Index_in_liker_array = poll.likers.indexOf(user_id);

        if (user_Index_in_liker_array !== -1) {
            poll.likers.splice(user_Index_in_liker_array, 1);
            poll.total_likes=poll.likers?.length;
            await poll.save();
            await UserCollection.findByIdAndUpdate(user_id, {
                $pull: { liked_polls: poll._id }
            });
            return res.status(200).json({ message: 'Unlike ' });
        } else {
            poll.likers.push(user);
            poll.total_likes=poll.likers?.length;
            await poll.save();

            await UserCollection.findByIdAndUpdate(user_id, {
                $push: { liked_polls: poll._id }
            });
            return res.status(200).json({ message: 'Liked successfully' });
        }

    } catch (error) {
        console.error('Error liking/unliking poll:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

/////Votepoll

exports.voteOnPoll = async (req, res) => {
    try {
        const { poll_id, option, user_id } = req.body;

        const poll = await PollCollection.findOne({ _id: poll_id });

     
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }
 
        if (!poll.isActive) {
            return res.status(400).json({ message: 'Poll is not active' });
        }

        const expirationDate = new Date(poll.expirationTime - 19800000);
        const now = Date.now();
        const diffInMs = expirationDate.getTime() - now;

        if (diffInMs > 0 && poll.status === "open") {

            const hasVoted = poll.voters.some(voterId => String(voterId) === user_id);

            if (hasVoted) {
                // User has already voted, so unvote before voting again
                const votedOption = poll.options.find(opt => opt.voters.includes(user_id));
                if (votedOption) {
                    votedOption.voters.pull(user_id);
                    votedOption.count = votedOption.voters.length;
                }
                
                poll.voters.pull(user_id);
                poll.total_votes=poll.voters?.length;
                await poll.save();
                await UserCollection.findByIdAndUpdate(user_id, {
                    $pull: { voted_polls: poll._id }
                });

                return res.status(200).json({ message: 'Vote removed . Please vote again.' });
            } else {
                // User has not voted yet, so vote now
                const selectedOption = poll.options.find(opt => opt.option === option);
                if (!selectedOption) {
                    return res.status(404).json({ message: 'Option not found for this poll' });
                }

                selectedOption.voters.push(user_id);
                selectedOption.count = selectedOption.voters.length;

                poll.voters.push(user_id);
                poll.total_votes=poll.voters?.length;
                await poll.save();
                await UserCollection.findByIdAndUpdate(user_id, {
                    $addToSet: { voted_polls: poll._id }
                });

                return res.status(200).json({ message: 'Vote recorded successfully.' });
            }
        } else {
            // Poll has expired
            poll.status = "closed";
            await poll.save();
            return res.status(200).json({
                message: 'Poll has expired',
                poll
            });
        }
    } catch (error) {
        console.error('Error voting on poll:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
/////getpollbyid

exports.getPollById = async (req, res) => {
    const { poll_id } = req.body;
    try {
        
         const poll = await PollCollection.findOne({ _id: poll_id })
         .populate({
            path: 'category',
            model: 'categorycollection',
            select: '_id category_name' 
        })
        .populate({
            path: 'createdBy',
            model: 'usercollection',
            select: '_id user_name user_profile' 
        })
        .populate({
            path: 'likers',
            model: 'usercollection',
            select: '_id user_name user_type' 
        })
        .populate({
            path: 'voters',
            model: 'usercollection',
            select: '_id user_name user_type' 
        })
        .populate({
            path: 'comments',
            model: 'commentscollection',
            populate: {
                path: 'user_id',
                model: 'usercollection',
                select: '_id user_name' 
            }
        });
        
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        const comments = await CommentCollection.find({ poll_id: poll._id });
        const pollWithComments = {
            _id: poll._id,
            createdAt: poll.createdAt,
            poll_id: poll.poll_id,
            title: poll.title,
            age:poll.age,
            gender:poll.gender,
            category: poll.category,
            question: poll.question,
            options: poll.options,
            status: poll.status,
            createdBy: poll.createdBy,
            likers: poll.likers,
            voters: poll.voters,
            isActive: poll.isActive,
            winner: poll.winner,
            expirationTime: poll.expirationTime,
            comments: comments
        };

        
        return res.status(200).json(pollWithComments);

    } catch (error) {
       
        console.error('Error fetching poll by ID:', error);
        return res.status(500).json({ error: 'Internal server error',Message : error.message});
    }
};

////getwin

exports.getwin = async (req, res) => {
    const { poll_id } = req.body;

    try {
        const pollCollection = await PollCollection.findOne({ _id: poll_id });

        if (!pollCollection) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        let totalVotes = 0;
        let highestCount = 0;
        let winningOptions = [];

        pollCollection.options.forEach(option => {
            totalVotes += option.count;
            if (option.count > highestCount) {
                highestCount = option.count;
                winningOptions = [option.option];
            } else if (option.count === highestCount) {
                winningOptions.push(option.option);
            }
        });

        const expirationDate = new Date(pollCollection.expirationTime - 19800000);

        const now = Date.now();

        const diffInMs = expirationDate.getTime() - now;

        console.log(diffInMs);

        if (diffInMs < 0 ) {
            pollCollection.status = "closed";
            pollCollection.winner = winningOptions.length > 0 ? winningOptions[0] : "No winner"; 
        } 
            
        else {
            pollCollection.status == "open";

        }
      
        await pollCollection.save();

       
        return res.status(200).json({ pollCollection, winner: pollCollection.winner });

    } catch (error) {

        console.error('Error fetching winner:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getmultiplePollById = async (req, res) => {
    const { poll_ids } = req.body; 
    try {
        
        const ids = poll_ids.map(obj => obj.poll_id);

       
        const polls = await PollCollection.find({ _id: { $in: ids } })
            .populate({
                path: 'category',
                model: 'CategoryCollection',
                select: '_id category_name' 
            })
            .populate({
                path: 'createdBy',
                model: 'usercollection',
                select: '_id user_name user_profile' 
            })
            .populate({
                path: 'likers',
                model: 'usercollection',
                select: '_id user_name user_type' 
            })
            .populate({
                path: 'voters',
                model: 'usercollection',
                select: '_id user_name user_type' 
            })
            .populate({
                path: 'comments',
                model: 'commentscollection',
                populate: {
                    path: 'user_id',
                    model: 'usercollection',
                    select: '_id user_name' 
                }
            });

        if (!polls.length) {
            return res.status(404).json({ message: 'Polls not found' });
        }

        const pollsWithComments = await Promise.all(polls.map(async (poll) => {
            const comments = await CommentCollection.find({ poll_id: poll._id });
            return {
                _id: poll._id,
                created_date: poll.created_date,
                poll_id: poll.poll_id,
                title: poll.title,
                age:poll.age,
                gender:poll.gender,
                category: poll.category,
                question: poll.question,
                options: poll.options,
                status: poll.status,
                createdBy: poll.createdBy,
                likers: poll.likers,
                voters: poll.voters,
                isActive: poll.isActive,
                winner: poll.winner,
                expirationTime: poll.expirationTime,
                comments: comments
            };
        }));

     
        return res.status(200).json(pollsWithComments);

    } catch (error) {
        console.error('Error fetching polls by IDs:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};









////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// exports.create = async(req,res,next)=>{
//     try
//     {
    
//     const {poll_title,question,options,createBy,end_date,winner,likes,total_likes,votes,total_votes,comments,reply,total_comments} = req.body;

//     const Doc = new SampleModel({poll_title,question,options,createBy,end_date,winner,likes,total_likes,votes,total_votes,comments,reply,total_comments});
//     await Doc.save();
    
//     return res.status(201).json({Message:"Poll  created successfully",data:Doc})
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
//         const{poll_title,question,options,createBy,end_date,winner,likes,total_likes,votes,total_votes,comments,reply,total_Comments} = req.body;

//         const updatedObject = {};

//         if(poll_title) updatedObject.poll_title = poll_title;
//         if(question) updatedObject.question = question;
//         if(options) updatedObject.options = options;
//         if(createBy) updatedObject.createBy = createBy;
//         if(end_date) updatedObject.createBy = createBy;
//         if(winner) updatedObject.winner = winner;
//         if(likes) updatedObject.likes = likes;
//         if(total_likes) updatedObject.total_likes = total_likes;
//         if(votes) updatedObject.votes = votes;
//         if(total_votes) updatedObject.total_votes = total_votes;
//         if(comments) updatedObject.comments = comments;
//         if(reply) updatedObject.reply = reply;
//         // if(total_Comments) updatedObject.total_Comments = total_Comments;
//         const updatedRecord = await SampleModel.findByIdAndUpdate(id,updatedObject, {new:true});

//         if(!updatedRecord){
//             return res.status(400).json({error:'Record not found'});
//         }
        
//         res.status(200).json({message:"Poll Updated Successfully", data : updatedRecord})
        
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
//     return res.status(200).json({Message:"Poll deleted successfully"});       

//     }
//     catch(err){
//         return res.status(400).json({message:err.message});
//     }    

