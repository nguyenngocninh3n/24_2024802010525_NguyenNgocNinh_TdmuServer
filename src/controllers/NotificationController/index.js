const { RESPONSE_STATUS } = require('../../utils/constants')
const notificationHelper = require('./notificationHelper')

class NotificationController {
  handleGetNotificationByUserID = async (req, res) => {
    const { userID } = req.params
    console.log('into handle  get notification by userID: ', userID)
    const response = await notificationHelper.getNotificationByUserID(userID)
    if (response.status === RESPONSE_STATUS.SUCCESS) {
      res.status(200).json(response)
    } else {
      res.status(500).json(response)
    }
  }
}

module.exports = new NotificationController()
