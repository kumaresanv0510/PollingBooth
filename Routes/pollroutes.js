const {Router} = require('express');
const router = Router();

const {createpoll,getallpolls,updatepoll,likeOnPoll,voteOnPoll,getPollById,getwin,getmultiplePollById,deletepoll} = require('../Controller/pollcontroller')


router.post('/create',createpoll);
router.post('/createpoll',createpoll);
router.get('/getallpolls',getallpolls);
router.post('/updatepoll',updatepoll);
router.post('/deletepoll',deletepoll);
router.post('/likeOnPoll',likeOnPoll);
router.post('/voteOnPoll',voteOnPoll);
router.post('/getPollById',getPollById);
router.post('/getwin',getwin);
router.post('/multipoll', getmultiplePollById);

// router.post('/update/:id',update);
// router.get('/getbyid/:id',getbyid);
// router.post('/delete/:id',remove);
// router.get('/getallpolls', getallpolls);
module.exports = router;