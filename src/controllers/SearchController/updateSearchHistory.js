const searchHistoryModel = require("../../models/searchHistory.model")

const findSearchHistoryListByUserID = async userID => {
    const resposne = await searchHistoryModel.find({userID}).sort({'updatedAt': 'desc'})
    return resposne
}

const findSearchHistoryById = async (_id) => {
    const resposne = await searchHistoryModel.findById(_id)
    return resposne
} 

const findSearchHistoryByParams= async (userID, search, type) => {
    const resposne = await  searchHistoryModel.findOne({search, type, userID})
    return resposne
} 


const addSearchHistory = async (userID, search, type) => {
   const response = await searchHistoryModel.create({userID, search, type})
   console.log('add search history: ', response)
   return response
}

const updateSearchHistory = async (_id) => {
    const response = await searchHistoryModel.findByIdAndUpdate(_id, {}, {returnDocument:'after'})
    console.log('update search history: ', response)
    return response
 }

 const removeSearchHistoryBySearchID = async (searchID) => {
    await searchHistoryModel.findByIdAndDelete(searchID)
 }

 const removeAllSearchHistoryByUserID = async (userID) => {
    await searchHistoryModel.deleteMany({userID})
 }

 const searchHistoryHelper = {
    findSearchHistoryListByUserID,
    findSearchHistoryById,
    findSearchHistoryByParams,
    addSearchHistory,
    updateSearchHistory,
    removeSearchHistoryBySearchID,
    removeAllSearchHistoryByUserID
 }

 module.exports = searchHistoryHelper