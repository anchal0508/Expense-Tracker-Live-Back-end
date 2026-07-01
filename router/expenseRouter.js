
const router = require('express').Router();
const {addExp, allExp} = require('../controller/expController');
const {auth} = require('../middleware/auth');

router.post('/addExp', auth, addExp);
router.get('/allExp', auth, allExp);

module.exports = router;