const router = require('express').Router();
const {addUser, login, profile, logout} = require('../controller/userController');
const auth = require('../middleware/auth');

router.post('/addUser', addUser);
router.post('/login', login);
router.get('/profile',  auth, profile);
router.post('/logout', auth, logout);


module.exports = router;