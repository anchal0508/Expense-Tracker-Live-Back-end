// 5
// Shree


const router = require('express').Router();
const {forgotReq, passwordverification, updatePassword} = require('../controller/passwordController');

router.post('/forgotreq', forgotReq);
router.get('/passwordverification/:id', passwordverification);
router.post('/updatepassword/:resetPasswordId', updatePassword);

module.exports = router;