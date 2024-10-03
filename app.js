const {Router} = require('express');
const router = Router();

// router.use('/api',require('./Routes/routes'));

router.use('/createUser',require('./Routes/userroutes'));
router.use('/category',require('./Routes/categoryroutes'));
router.use('/poll',require('./Routes/pollroutes'));
router.use('/comments',require('./Routes/commentsroutes'));



module.exports = router