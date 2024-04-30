'use strict'

const { image } = require('../models/image.model')
const { Types } = require('mongoose')

const getAllImageByCameraId = async ({ cameraId }) => {
  return await image
    .find({ camera_id: new Types.ObjectId(cameraId) })
    .lean()
    .exec()
}

const getImageByCameraIdAndTime = async ({ cameraId, startTime, endTime }) => {
  return await image
    .find({
      camera_id: new Types.ObjectId(cameraId),
      capture_time: { $gte: startTime },
      capture_time: { $lte: endTime }
    })
    .lean()
    .exec()
}

const getImageByCameraIdAndDate = async ({ cameraId, date }) => {
  const startTime = new Date(date)
  const endTime = new Date(date)
  endTime.setDate(endTime.getDate() + 1)
  return await image
    .find({
      camera_id: new Types.ObjectId(cameraId),
      capture_time: { $gte: startTime },
      capture_time: { $lte: endTime }
    })
    .lean()
    .exec()
}

module.exports = {
  getAllImageByCameraId,
  getImageByCameraIdAndTime,
  getImageByCameraIdAndDate
}
