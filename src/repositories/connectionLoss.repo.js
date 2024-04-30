'use strict'

const { connectionLoss } = require('../models/connectionLoss.model')
const { Types } = require('mongoose')

const getAllConnectionLossByCameraId = async ({ cameraId }) => {
  return await connectionLoss
    .find({ camera_id: new Types.ObjectId(cameraId) })
    .lean()
    .exec()
}

const getConnectionLossByCameraIdAndTime = async ({ cameraId, startTime, endTime }) => {
  return await connectionLoss
    .find({ camera_id: new Types.ObjectId(cameraId), start_time: { $gte: startTime }, end_time: { $lte: endTime } })
    .lean()
    .exec()
}

const getConnectionLossByCameraIdAndDate = async ({ cameraId, date }) => {
  const startTime = new Date(date)
  const endTime = new Date(date)
  endTime.setDate(endTime.getDate() + 1)
  return await connectionLoss
    .find({ camera_id: new Types.ObjectId(cameraId), start_time: { $gte: startTime }, end_time: { $lte: endTime } })
    .lean()
    .exec()
}

module.exports = {
  getAllConnectionLossByCameraId,
  getConnectionLossByCameraIdAndTime,
  getConnectionLossByCameraIdAndDate
}
