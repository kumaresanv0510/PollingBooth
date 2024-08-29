const SampleModel = require('../Model/usermodel');

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

//////sign up page

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

/////login page


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


