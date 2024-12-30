const express = require('express')
const SearchController = require('../controllers/SearchController')
const router = express.Router()

router.get('/post/:userID/:queryString', SearchController.getSearchPost)
router.get('/user/:userID/:queryString', SearchController.getSearchUser)
router.get('/group/:userID/:queryString', SearchController.getSearchGroup)
router.get('/image/:userID/:queryString', SearchController.getSearchImage)
router.get('/video/:userID/:queryString', SearchController.getSearchVideo)
router.get('/history/:userID', SearchController.handleGetSearchHistoryListByUserID)
router.post('/history/add/:userID/:type/:search', SearchController.handleAddSearchHistory)
router.delete('/history/remove/all/:userID', SearchController.handleRemoveSearchHistoryByUserID)
router.delete('/history/remove/:searchID', SearchController.handleRemoveSearchHistoryByID)

module.exports = router