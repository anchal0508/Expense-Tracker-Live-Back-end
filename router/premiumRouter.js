// 5
// Shree


const { auth } = require('../middleware/auth');
const router = require('express').Router();
const {gold, update} = require('../controller/premiumController');

router.get('/gold', auth, gold);
router.post('/update', auth, update);


module.exports = router;