const {Router} = require('express');

const router = Router();

const {createComment,createReply,likeComment,likeReply,getCommentsByPollId} = require('../Controller/commentscontroller')




router.post('/createComment',createComment);
router.post('/createReply',createReply);
router.post('/likeComment',likeComment);
router.post('/likeReply',likeReply);
router.post('/getCommentsByPollId',getCommentsByPollId);

// router.post('/create',create);
// router.get('/getall',getall);
// router.post('/update/:id',update);
// router.get('/getbyid/:id',getbyid);
// router.post('/remove/:id',remove);

module.exports = router;