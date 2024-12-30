const pollModel = require("../../models/poll.model")
const { RESPONSE_STATUS } = require("../../utils/constants")

class PollController {
  
    getPoll = async (req, res) => {
    const { pollID } = req.params
    pollModel
      .findById(pollID)
      .then(response => {
        res.status(200).json({ status: RESPONSE_STATUS.SUCCESS, data: response })
      })
      .catch(error => {
        res.status(500).json({ status: RESPONSE_STATUS.ERROR, data: null })
      })
  }

  createPoll = async (req, res) => {
    const data = req.body
    console.log('into create poll: ', data)
    pollModel
      .create({
        targetID: data.targetID,
        userID: data.userID,
        type: data.type, //POST OR CONVENTION
        question: data.question,
        options: data.options.map(item => ({ value: item })),
        results: [],
        editable: data.editable ?? false,
      })
      .then(response => {
        console.log('create poll successfully')
        res.status(200).json({ status: RESPONSE_STATUS.SUCCESS, data: response })
      })
      .catch(error => {
        console.log('error when create poll')
        res.status(500).json({ status: RESPONSE_STATUS.ERROR, data: null })
      })
  }

  closePoll = async (req, res) => {
    const { pollID } = req.params
    pollModel
      .findByIdAndUpdate(pollID, { status: POLL_STATUS.DOING })
      .then(response => {
        res.status(200).json({ status: RESPONSE_STATUS.SUCCESS, data: response })
      })
      .catch(error => {
        res.status(500).json({ status: RESPONSE_STATUS.ERROR, data: null })
      })
  }

  updateOption = async (req, res) => {
    const { pollID } = req.params
    const newOptions = req.body.options.map(item => ({ value: item }))
    pollModel
      .findByIdAndUpdate(pollID, { $push: { options: newOptions } })
      .then(response => {
        res.status(200).json({ status: RESPONSE_STATUS.SUCCESS, data: response })
      })
      .catch(error => {
        res.status(500).json({ status: RESPONSE_STATUS.ERROR, data: null })
      })
  }

  addPolling = async (req, res) => {
    const { pollID } = req.params
    const {userID, optionIDs} = req.body
    console.log('into add polling: ', req.body)
    pollModel
      .findByIdAndUpdate(pollID, { $push: { results: { userID, optionIDs } } }, {returnDocument:'after'})
      .then(response => {
        res.status(200).json({ status: RESPONSE_STATUS.SUCCESS, data: response })
      })
      .catch(error => {
        res.status(500).json({ status: RESPONSE_STATUS.ERROR, data: null })
      })
  }

  updatePolling = async (req, res) => {
    const { pollID } = req.params
    const { userID, optionIDs } = req.body
    console.log('into update polling: ', req.body)

    pollModel
      .updateOne(
        { _id: pollID, 'results.userID': userID },
        {
          $set: {
            'results.$.optionIDs': optionIDs
          },
        }
      )
      .then(response => {
        res.status(200).json({ status: RESPONSE_STATUS.SUCCESS, data: response })
      })
      .catch(error => {
        res.status(500).json({ status: RESPONSE_STATUS.ERROR, data: null })
      })
  }
}

module.exports = new PollController()
