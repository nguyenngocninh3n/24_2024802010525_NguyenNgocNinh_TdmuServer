const getUserPosts = async (userID, ownerID, status) => {
  const queyObj = {
    userID: userID,
    status: status
  }
  if (ownerID === userID) {
    const posts = await postModel.find(queyObj).sort({ createdAt: 'desc' })
    return posts
  } else {
    const friendStatus = await friendHelper.getFriendStatus(ownerID, userID)
    console.log('friend status: ', friendStatus)
    const scope = friendStatus === SCOPE.FRIEND ? [SCOPE.PUBLIC, SCOPE.FRIEND] : SCOPE.PUBLIC
    console.log('scope: ', scope)
    const posts = await postModel
      .find({ ...queyObj, scope: { $in: scope } })
      .sort({ createdAt: 'desc' })
    return posts
  }
}
