const {Router} = require('express');
const router = Router();
const {getall,update,getbyid,remove,signup,login,addandremovefollower,getProfile} = require('../Controller/usercontroller')



router.get('/getall',getall);
router.post('/update/:id',update);
router.get('/getbyid/:id',getbyid);
router.post('/delete/:id',remove);
router.post('/signup',signup);
router.post('/login',login);
router.post('/addandremovefollower',addandremovefollower);
router.post('/getprofile',getProfile);

module.exports = router;