const admin = require('firebase-admin')

const sendNotification = async (fcmToken, data) => {
  const message = {
    token: fcmToken,
    data: data
  }

  try {
    const response = await admin.messaging().send(message)
    console.log('Thông báo đã được gửi:', response)
  } catch (error) {
    console.error('Lỗi khi gửi thông báo:', error)
  }
}




const createNotifyData = ({ channelID, senderID, senderName, senderAvatar, title, body, type, targetID, ownerID, meetingId }) => {
  const data = {
    channelID: channelID?.toString(),
    senderID,
    senderName,
    senderAvatar,
    title,
    body,
    type,
    targetID: targetID?.toString() ?? '',
    ownerID: ownerID ?? '',
    meetingId: meetingId ?? ''
  }
  return data
}
const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD') // Tách chữ và dấu thành các thành phần riêng
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ các dấu
    .replace(/đ/g, 'd') // Chuyển 'đ' thành 'd'
    .replace(/Đ/g, 'D') // Chuyển 'Đ' thành 'D'
    .toLowerCase(); // Chuyển về chữ thường
};
const fcmNotify = {
 createNotifyData,
 sendNotification,
 removeVietnameseTones
}
module.exports = fcmNotify