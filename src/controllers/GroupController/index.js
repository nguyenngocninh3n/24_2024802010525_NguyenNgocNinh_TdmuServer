const { RESPONSE_STATUS, MEMBER_ROLE, MEMBER_STATUS, SCOPE } = require('../../utils/constants')
const groupHelper = require('./groupHelper')

class GroupController {
  // GET METHOD

  async handleGetAllgroup(req, res) {
    console.log('into get all group')
    groupHelper.getAllgroup().then(response => {
      if (response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
      } else {
        res.status(500).json(response)
      }
    })
  }

  async handleGetgroupByID(req, res) {
    const { groupID } = req.params
    console.log('into get group by id: ', groupID)
    groupHelper.getGroupByID(groupID).then(response => {
      if (response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
      } else {
        res.status(500).json(response)
      }
    })
  }

  async handleGetGroupsByUserID(req, res) {
    const {userID} = req.params
    console.log('handle get group by userID: ', userID)
    groupHelper.getGroupsByUserID(userID).then(response => {
      if (response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
      } else {
        res.status(500).json(response)
      }
    })
  }

  async handleGetGroupPostsOfUser(req, res) {
    const {groupID, userID} = req.params
    console.log('handle get group posts of user: ', groupID, ' ', userID)
    groupHelper.getGroupPostsOfUser(groupID, userID).then(response => {
      if (response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
      } else {
        res.status(500).json(response)
      }
    })
  }

  async handleGetGroupPostsOfGroup(req, res) {
    const {groupID} = req.params
    console.log('handle get groupposts of group: ', groupID)
    groupHelper.getGroupPostsOfGroup(groupID).then(response => {
      if (response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
      } else {
        res.status(500).json(response)
      }
    })
  }

  async handleGetGroupMemberByUserID(req, res) {
    const { groupID, userID } = req.params
    console.log('into handle get group member by user id: ', groupID, ' ', userID)
    groupHelper.getGroupMemberByUserID(groupID, userID).then(response => {
      if (response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
      } else {
        res.status(500).json(response)
      }
    })
  }

  async handleGetGroupMembersByID(req, res) {
    const {groupID} = req.params
    console.log('into handle get group members by id: ', groupID)
    groupHelper.getGroupMembersByID(groupID).then(response => {
      if (response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
      } else {
        res.status(500).json(response)
      }
    })

  }

  async handleGetPendingGroupMembersByID(req, res) {
    const {groupID} = req.params
    console.log('into handle get pending group members by id: ', groupID)
    groupHelper.getPendingGroupMembersByID(groupID).then(response => {
      if (response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
      } else {
        res.status(500).json(response)
      }
    })

  }

  async handleGetBlockingGroupMembersByID(req, res) {
    const {groupID} = req.params
    console.log('into handle get blocking group members by id: ', groupID)
    groupHelper.getBlockingGroupMembersByID(groupID).then(response => {
      if (response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
      } else {
        res.status(500).json(response)
      }
    })

  }
  async handleGetGroupImagesByID(req, res) {}

  async handleGetGroupVideosByID(req, res) {}

  //MEMBER ACTION

  async handleRequestJoinGroup(req, res) {
    const { groupID, userID } = req.params
    const userData = req.body
    console.log('join request join group: ', groupID, ' ', userID)
    const groupData = await groupHelper.getGroupByID(groupID)

    if (groupData.data.scope === SCOPE.PUBLIC) {
      const response = await groupHelper.storeGroupMember(
        groupData.data,
        MEMBER_ROLE.MEMBER,
        MEMBER_STATUS.ACCEPT,
        userData
      )

      console.log('response data after store member: ', response)
      if (response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
        groupHelper.storeGroupUser(groupID, userID)
        groupHelper.updateMemberGroupLengthForIncrease(groupID)
      } else {
        res.status(500).json(response)
      }
    } else {
      console.log('userData: ', userData)
      const response = await groupHelper.requestJoinGroup(groupID, userData)
      console.log('response data after store member: ', response)
      if (response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
      } else {
        res.status(500).json(response)
      }
    }
  }

  async handleCancelRequestJoinGroup(req, res) {
    const { groupID, userID } = req.params
    const response = await groupHelper.cancleRequestJoinGroup(groupID, userID)
    if (response.status === RESPONSE_STATUS.SUCCESS) {
      res.status(200).json(response)
    } else {
      res.status(500).json(response)
    }
  }

  async handleAcceptMember(req, res) {
    const { groupID, userID } = req.params
    console.log('join request join group: ', groupID, ' ', userID)

    const response = await groupHelper.acceptMember(groupID, userID)
    groupHelper.storeGroupUser(groupID, userID)
    groupHelper.updateMemberGroupLengthForIncrease(groupID)
    if (response.status === RESPONSE_STATUS.SUCCESS) {
      res.status(200).json(response)
    } else {
      res.status(500).json(response)
    }
  }

  async handleBlockMember(req, res) {
    const { groupID, userID } = req.params
    console.log('join BlockMember: ', groupID, ' ', userID)

    const response = await groupHelper.blockMember(groupID, userID)
    if (response.status === RESPONSE_STATUS.SUCCESS) {
      res.status(200).json(response)
      groupHelper.deleteGroupUser(groupID, userID)
      groupHelper.updateMemberGroupLengthForDecrease(groupID)
    } else {
      res.status(500).json(response)
    }
  }

  async handleUnBlockMember(req, res) {
    const { groupID, userID } = req.params
    console.log('join un BlockMember: ', groupID, ' ', userID)

    const response = await groupHelper.unBlockMember(groupID, userID)
    if (response.status === RESPONSE_STATUS.SUCCESS) {
      res.status(200).json(response)
    } else {
      res.status(500).json(response)
    }
  }

  async handleExitGroup(req, res) {
    const { groupID, userID } = req.params
    const response = await groupHelper.exitGroup(groupID, userID)
    if (response.status === RESPONSE_STATUS.SUCCESS) {
      res.status(200).json(response)
      groupHelper.deleteGroupUser(groupID, userID)
      groupHelper.updateMemberGroupLengthForDecrease(groupID)

    } else {
      res.status(500).json(response)
    }
  }

  async handleDeleteMember(req, res) {
    const { groupID, userID } = req.params
    const response = await groupHelper.exitGroup(groupID, userID)
    if (response.status === RESPONSE_STATUS.SUCCESS) {
      res.status(200).json(response)
      groupHelper.deleteGroupUser(groupID, userID)
      groupHelper.updateMemberGroupLengthForDecrease(groupID)

    } else {
      res.status(500).json(response)
    }
  }

  // GROUP ACTION

  async handleCreateGroup(req, res) {
    const { name, bio, scope, userData } = req.body
    console.log('into create group: user data: ', userData)

    groupHelper.createGroup(name, bio, scope, userData).then(response => {
      if (response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
        groupHelper.storeGroupMember(
          response.data._id,
          MEMBER_ROLE.ADMIN,
          MEMBER_STATUS.ACCEPT,
          userData
        )
        groupHelper.storeGroupUser(response.data._id, userData._id)
        groupHelper.updateMemberGroupLengthForIncrease(response.data._id)
      } else {
        res.status(500).json(response)
      }
    })
  }

  async handleUpdateGroupName(req, res) {
    const { value } = req.body
    const { groupID } = req.params
    console.log('into handle update groupName: ', groupID, ' ', value)
    groupHelper.updateGroupName(groupID, value).then(response => {
      if (response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
      } else {
        res.status(500).json(response)
      }
    })
  }

  async handleUpdateGroupAvatar(req, res) {
    const { value } = req.body
    const { groupID } = req.params
    console.log('into handle update  group avatar: ', groupID, ' ', value)
    groupHelper.updateGroupAvatar(groupID, value).then(response => {
      if (response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
      } else {
        res.status(500).json(response)
      }
    })
  }

  async handleUpdateGroupBio(req, res) {
    const { value } = req.body
    const { groupID } = req.params
    console.log('into handle update group bio: ', groupID, ' ', value)

    groupHelper.updateGroupBio(groupID, value).then(response => {
      if (response.status === RESPONSE_STATUS.SUCCESS) {
        res.status(200).json(response)
      } else {
        res.status(500).json(response)
      }
    })
  }
}

module.exports = new GroupController()
