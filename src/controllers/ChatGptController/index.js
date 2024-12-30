const { RESPONSE_STATUS } = require("../../utils/constants")
const chatgptHelper = require("./chatgptHelper")

class ChatGPTController {

     handleGetChatGPTByUserID = async (req, res) => {
        const {userID} = req.params
        chatgptHelper.getChatGPTByUserID(userID).then(response => {
            if(response.status === RESPONSE_STATUS.SUCCESS) {
                res.status(200).json(response)
            }
            else {
                res.status(500).json(response)
            }
        })

    }

    handlePostNewChat = async (req, res) => {
        const {userID} = req.params
        const {question} = req.body
        console.log('into handlePost NewChat in ChatGPT Controller: ', userID, ' ', question)
        chatgptHelper.postNewChat(userID, question).then(response => {
            
            res.status(200).json(response)
        })

    }
}

module.exports = new ChatGPTController()