const {Router} = require('express');
const router = Router();
const {createUser,addandremovefollower,getall} = require('../Controller/usercontroller')


router.post('/createUser',createUser);
router.post('/addandremovefollower',addandremovefollower);
router.get('/getall',getall);
// router.post('/update/:id',update);
// router.get('/getbyid/:id',getbyid);
// router.post('/delete/:id',remove);
// router.post('/signup',signup);
// router.post('/login',login);

module.exports = router;