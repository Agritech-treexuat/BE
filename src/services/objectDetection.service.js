const { Types } = require('mongoose')
const {
  getAllObjectDetectionByCameraId,
  getObjectDetectionByCameraIdAndTime,
  getObjectDetecionByCameraIdAndDate
} = require('../models/repositories/objectDetection.repo')
const { BadRequestError, MethodFailureError } = require('../core/error.response')
const { isValidObjectId } = require('../utils')

class ObjectDetectionService {
  static async getAllObjectDetectionByCameraId({ cameraId }) {
    if (!cameraId) throw new BadRequestError('CameraId is required')
    if (!isValidObjectId(cameraId)) throw new BadRequestError('CameraId is not valid')
    const objectDetections = await getAllObjectDetectionByCameraId({ cameraId })
    return objectDetections
  }

  static async getObjectDetectionByCameraIdAndTime({ cameraId, startTime, endTime }) {
    if (!cameraId) throw new BadRequestError('CameraId is required')
    if (!isValidObjectId(cameraId)) throw new BadRequestError('CameraId is not valid')
    if (!startTime) startTime = new Date(0)
    if (!endTime) endTime = new Date()
    const objectDetections = await getObjectDetectionByCameraIdAndTime({ cameraId, startTime, endTime })
    return objectDetections
  }

  static async getObjectDetecionByCameraIdAndDate({ cameraId, date }) {
    if (!cameraId) throw new BadRequestError('CameraId is required')
    if (!isValidObjectId(cameraId)) throw new BadRequestError('CameraId is not valid')
    if (!date) throw new BadRequestError('Date is required')
    const objectDetections = await getObjectDetecionByCameraIdAndDate({ cameraId, date })
    return objectDetections
  }
}

module.exports = ObjectDetectionService
