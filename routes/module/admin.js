const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/admin-controller')

router.get('/timelists/:id', adminController.getTimeLists)
router.get('/timelists', adminController.getTimeLists) // 上面兩者 adminController都是 getTimeLists, 差別在路由是否有 id
router.post('/timelists', adminController.postTimeList)
router.put('/timelists/:id', adminController.putTimeList)
router.delete('/timelists/:id', adminController.deleteTimeList)
router.get('/userlists', adminController.getUserLists)
router.use('/', (req, res) => res.redirect('/admin/userlists'))

module.exports = router