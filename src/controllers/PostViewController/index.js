const { RESPONSE_STATUS } = require("../../utils/constants")
const postviewHelper = require("./postviewHelper")


class PostViewController {

    addPostview = async (req, res) => {
        const {userID, postID} = req.params
        postviewHelper.handleAddPostView(userID, postID).then(response => {
            if(response.status === RESPONSE_STATUS.SUCCESS) {
                res.status(200).json(response)
            } else {
                res.status(500).json(response)
            }
        })
    }

    removePostView = async (req, res) => {
        const {userID, postID} = req.params
        postviewHelper.handleRemovePostView(userID, postID).then(response => {
            if(response.status === RESPONSE_STATUS.SUCCESS) {
                res.status(200).json(response)
            } else {
                res.status(500).json(response)
            }
        })
    }
}

module.exports = new PostViewController()