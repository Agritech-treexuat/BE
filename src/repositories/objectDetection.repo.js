'use strict'

const { objectDetection } = require('../models/objectDetection.model')
const { Types } = require('mongoose')

const getAllObjectDetectionByCameraId = async ({ cameraId }) => {
  return await objectDetection
    .find({ camera_id: new Types.ObjectId(cameraId) })
    .lean()
    .exec()
}

const getObjectDetectionByCameraIdAndTime = async ({ cameraId, startTime, endTime }) => {
  return await objectDetection
    .find({ camera_id: new Types.ObjectId(cameraId), start_time: { $gte: startTime }, end_time: { $lte: endTime } })
    .lean()
    .exec()
}

const getObjectDetecionByCameraIdAndDate = async ({ cameraId, date }) => {
  const startTime = new Date(date)
  const endTime = new Date(date)
  endTime.setDate(endTime.getDate() + 1)
  return await objectDetection
    .find({ camera_id: new Types.ObjectId(cameraId), start_time: { $gte: startTime }, end_time: { $lte: endTime } })
    .lean()
    .exec()
}

module.exports = {
  getAllObjectDetectionByCameraId,
  getObjectDetectionByCameraIdAndTime,
  getObjectDetecionByCameraIdAndDate
}
