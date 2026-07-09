
const router = require('express').Router();
const {addExp, allExp, deleteExp, downloadCSV, updateExp} = require('../controller/expController');
const {auth} = require('../middleware/auth');

router.get('/download', auth, downloadCSV);
router.post('/addExp', auth, addExp);
router.get('/allExp', auth, allExp);
router.delete('/delete/:id', auth, deleteExp);
router.put('/update/:id', auth, updateExp); 


module.exports = router;