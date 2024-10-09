const SampleModel = require('../Model/usermodel'); // Update this path if needed
const Usermodel = require('../Model/usermodel'); // Add this line for Usermodel
const commentscollection = require('../Model/commentsmodel');





////login user

exports.loginuser = async(req,res)=>{

    try {
        const { phone_number,password }=req.body;

        const existinguser = await Usermodel.findOne({phone_number});

        if(!existinguser)
            {
               return res.status(400).json({ message:"user not found"})
            }
        const isValidPassword = await bcrypt.compare(password,existinguser.password);
        if(!isValidPassword)
            {
                return res.status(400).json({message:"Password is incorrect"});
            }
        
        const token = jwt.sign({ id: existinguser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).json({
            user:existinguser,
            token,
            message:"user found"
        })

        
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}

exports.create = async(req,res,next)=>{
    try
    {
    
    const {user_name,e_mail,phno,dob,gender,password,age} = req.body;

    const Doc = new SampleModel({user_name,e_mail,phno,dob,gender,password,age});
    await Doc.save();
    
    return res.status(201).json({Message:"Document created successfully",data:Doc})
    }
    catch(err)
    {
    return res.status(400).json({Message:err.message})
    }

}

exports.getall = async(req,res,next)=> {
    try{
        const SampleDoc = await SampleModel.find({});
        return res.status(200).json({data:SampleDoc})
    }
    catch(err){
        return res.status(404).json({message:err.message})
    }
 }

exports.update = async (req,res,next)=>{
    try{
        const {id} = req.params;
        const{user_name,e_mail,phno,password,gender,age} = req.body;

        const updatedObject = {};

        if(user_name) updatedObject.user_name = user_name;
        if(e_mail) updatedObject.e_mail = e_mail;
        if(phno) updatedObject.phno = phno;
        if(password) updatedObject.password = password;
        if(gender) updatedObject.gender = gender;
        if(age) updatedObject.age = age;
        const updatedRecord = await SampleModel.findByIdAndUpdate(id,updatedObject, {new:true});

        if(!updatedRecord){
            return res.status(400).json({error:'Record not found'});
        }
        
        res.status(200).json({message:"Record Updated Successfully", data : updatedRecord})
        
    }
    catch(err){
        return res.status(400).json({message:err.message});
    }
}

exports.getbyid = async(req,res)=>{
    try{
    const {id} = req.params;

    const data = await SampleModel.findById(id);
    return res.status(200).json({data});       

    }
    catch(err){
        return res.status(400).json({message:err.message});
    }    
}

exports.remove = async(req,res)=>{
    try{
    const {id} = req.params;

    const data = await SampleModel.findByIdAndDelete(id);
    if(!data){
        return res.status(400).json({Message:"User not found"});       
    }
    return res.status(200).json({Message:"Document deleted successfully"});       

    }
    catch(err){
        return res.status(400).json({message:err.message});
    }    
}

// //////sign up page

exports.signup = async(req,res,next)=>{
    try
    {
    
    const {user_name,e_mail,phno,dob,gender,password,age} = req.body;
    const Doc = new SampleModel({user_name,e_mail,phno,dob,gender,password,age});
    await Doc.save();
    
    return res.status(201).json({Message:"Sign up Sucessfully",data:Doc})
    }
    catch(err)
    {
    return res.status(400).json({Message:err.message})
    }

}

// /////login page


exports.login = async(req,res)=>{
    try{
    const {phno,password} = req.body;

    const data = await SampleModel.findOne({phno,password});
    if(!data){
        return res.status(404).json({Message:"Invalid phoneNO or password"})
    }
    return res.status(200).json({Message:"Login successfully",data:data});       

    }
    catch(err){
        return res.status(400).json({message:err.message});
    }    
}

//////follow and unfollow

exports.addandremovefollower = async (req, res) => {
    const { follow_user_id, user_id } = req.body;

    try {
        if(follow_user_id == user_id){
            return res.status(500).json({ message: "Unable to follow yourself" });
        }
        // Retrieve the user by ID
        const user = await Usermodel.findById(follow_user_id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userIndexInFollowersArray = user.user_followers.indexOf(user_id);

        if (userIndexInFollowersArray !== -1) {
            // If user already follows, remove from followers
            user.user_followers.splice(userIndexInFollowersArray, 1);

            await user.save(); // Save changes

            return res.status(200).json({ message: 'Follower removed successfully' });
        } else {
            // If user is not following, add to followers
            user.user_followers.push(user_id);

            await user.save(); // Save changes

            return res.status(200).json({ message: 'Follower added successfully' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/////get profile

exports.getProfile = async (req, res) => {
    try {
        const { user_id } = req.body; // identifier can be phone number or email

        const user = await Usermodel.findOne({ _id : user_id})
        .populate([
            { path: 'created_polls', model: 'PollCollection', select: '_id ', 
                // populate:([
                //     {path: 'category', model: 'CategoryCollection', select: '_id category_name'},
                //     {path: 'createdBy', model: 'UserCollection', select: '_id user_name'}
                // ])
            },
            { path: 'created_polls.options', model: 'PollCollection', select: '_id option count' },

            { path: 'created_polls.likers', model: 'PollCollection'},
            { path: 'created_polls.voters', model: 'PollCollection'},



            { path: 'voted_polls', model: 'PollCollection', select: '_id created_date poll_id title category question options status  isActive expirationTime createdBy likers voters', 
                populate:{path: 'createdBy', model: 'UserCollection', select: '_id user_name'},
            },
            { path: 'voted_polls.options', model: 'PollCollection', select: '_id option count' },

            { path: 'voted_polls.likers', model: 'PollCollection'},
            { path: 'voted_polls.voters', model: 'PollCollection'},



            { path: 'liked_polls', model: 'PollCollection', select: '_id created_date poll_id title category question options status  isActive expirationTime createdBy likers voters', 
                populate:{path: 'createdBy', model: 'UserCollection', select: '_id user_name'},
            },
            { path: 'liked_polls.options', model: 'PollCollection', select: '_id option count' },

            { path: 'liked_polls.likers', model: 'PollCollection'},
            { path: 'liked_polls.voters', model: 'PollCollection'},


            { path: 'commented_polls', model: 'commentscollection', select: '_id comment_id poll_id comment likers Replies' },
            { path: 'commented_polls.Replies', model: 'commentscollection', select: '_id  reply_id poll_id  reply_msg likers' },

            { path: 'user_likers', model: 'usercollection', select: '_id user_name' },
            { path: 'user_used_category', model: 'CategoryCollection', select: '_id category_id category_name' },
            { path: 'user_followers', model: 'usercollection', select: '_id user_name' }
        ]);


        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


