const postviewModel = require("../../models/postview.model")
const { RESPONSE_STATUS } = require("../../utils/constants")


const handleGetPostViewByUserIDAndPostID = async (userID, postID) => {
    return await postviewModel.findOne({userID, postID}).then(response => response)
}


const handleAddPostView = async (userID, postID) => {
    const postviewItem = await handleGetPostViewByUserIDAndPostID(userID, postID)
    if(postviewItem) {
        return await postviewModel.create({userID, postID}).then(response => {
            console.log('addPostView successfully')
            return {
                status: RESPONSE_STATUS.SUCCESS,
                data: response
            }
        }).catch(error => {
            console.log('Error when add postview in postviewHelper: ', error)
            return {
                status: RESPONSE_STATUS.ERROR,
                data: error
            }
        })
    } else {
        return {
            status: RESPONSE_STATUS.SUCCESS,
            data: postviewItem  
        }
    }
}


const handleRemovePostView = async (userID, postID) => {
    return await postviewModel.findOneAndDelete({userID, postID}).then(response => {
        console.log('addPostView successfully')
        return {
            status: RESPONSE_STATUS.SUCCESS,
            data: response
        }
    }).catch(error => {
        console.log('Error when remove postview in postviewHelper: ', error)
        return {
            status: RESPONSE_STATUS.ERROR,
            data: error
        }
    })
}

const postviewHelper = {
    handleAddPostView,
    handleRemovePostView
}

module.exports = postviewHelper