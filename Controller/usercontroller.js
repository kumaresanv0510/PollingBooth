const SampleModel = require('../Model/usermodel');



// Create User
exports.createUser = async (req, res) => {
    try {
        const { user_name, email, phone_number, password,age,gender} = req.body;

        // Build the query object
        let query = { email };
        if (phone_number) {
            query = { $or: [{ email }, { phone_number }] };
        }

        const existingUser = await SampleModel.findOne(query);
        if (existingUser) {
            return res.status(409).json({ message: "User already exists",existingUser});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const token = jwt.sign({ phone_number }, process.env.JWT_SECRET_KEY);
        const newUser = new Usermodel({
            user_name,
            email,
            password: hashedPassword,
            phone_number,
            age,
            gender,
            token
        });

        const savedUser = await newUser.save();
        return res.status(201).json({ savedUser });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


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


////login user

// exports.loginuser = async(req,res)=>{

//     try {
//         const { phone_number,password }=req.body;

//         const existinguser = await Usermodel.findOne({phone_number});

//         if(!existinguser)
//             {
//                return res.status(400).json({ message:"user not found"})
//             }
//         const isValidPassword = await bcrypt.compare(password,existinguser.password);
//         if(!isValidPassword)
//             {
//                 return res.status(400).json({message:"Password is incorrect"});
//             }
        
//         const token = jwt.sign({ id: existinguser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

//         return res.status(200).json({
//             user:existinguser,
//             token,
//             message:"user found"
//         })

        
//     } catch (error) {
//         return res.status(500).json({message:error.message})
//     }
// }

// exports.create = async(req,res,next)=>{
//     try
//     {
    
//     const {user_name,e_mail,phno,dob,gender,password,age} = req.body;

//     const Doc = new SampleModel({user_name,e_mail,phno,dob,gender,password,age});
//     await Doc.save();
    
//     return res.status(201).json({Message:"Document created successfully",data:Doc})
//     }
//     catch(err)
//     {
//     return res.status(400).json({Message:err.message})
//     }

// }

exports.getall = async(req,res,next)=> {
    try{
        const SampleDoc = await SampleModel.find({});
        return res.status(200).json({data:SampleDoc})
    }
    catch(err){
        return res.status(404).json({message:err.message})
    }
 }

// exports.update = async (req,res,next)=>{
//     try{
//         const {id} = req.params;
//         const{user_name,e_mail,phno,password,gender,age} = req.body;

//         const updatedObject = {};

//         if(user_name) updatedObject.user_name = user_name;
//         if(e_mail) updatedObject.e_mail = e_mail;
//         if(phno) updatedObject.phno = phno;
//         if(password) updatedObject.password = password;
//         if(gender) updatedObject.gender = gender;
//         if(age) updatedObject.age = age;
//         const updatedRecord = await SampleModel.findByIdAndUpdate(id,updatedObject, {new:true});

//         if(!updatedRecord){
//             return res.status(400).json({error:'Record not found'});
//         }
        
//         res.status(200).json({message:"Record Updated Successfully", data : updatedRecord})
        
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
//     if(!data){
//         return res.status(400).json({Message:"User not found"});       
//     }
//     return res.status(200).json({Message:"Document deleted successfully"});       

//     }
//     catch(err){
//         return res.status(400).json({message:err.message});
//     }    
// }

// //////sign up page

// exports.signup = async(req,res,next)=>{
//     try
//     {
    
//     const {user_name,e_mail,phno,dob,gender,password,age} = req.body;
//     const Doc = new SampleModel({user_name,e_mail,phno,dob,gender,password,age});
//     await Doc.save();
    
//     return res.status(201).json({Message:"Sign up Sucessfully",data:Doc})
//     }
//     catch(err)
//     {
//     return res.status(400).json({Message:err.message})
//     }

// }

// /////login page


// exports.login = async(req,res)=>{
//     try{
//     const {phno,password} = req.body;

//     const data = await SampleModel.findOne({phno,password});
//     if(!data){
//         return res.status(404).json({Message:"Invalid phoneNO or password"})
//     }
//     return res.status(200).json({Message:"Login successfully",data:data});       

//     }
//     catch(err){
//         return res.status(400).json({message:err.message});
//     }    
// }


