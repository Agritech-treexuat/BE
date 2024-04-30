const { Types } = require('mongoose')
const {
  getAllImageByCameraId,
  getImageByCameraIdAndTime,
  getImageByCameraIdAndDate
} = require('../repositories/image.repo')
const { BadRequestError, MethodFailureError } = require('../core/error.response')
const { isValidObjectId } = require('../utils')

class ImageService {
  static async getAllImageByCameraId({ cameraId }) {
    if (!cameraId) throw new BadRequestError('CameraId is required')
    if (!isValidObjectId(cameraId)) throw new BadRequestError('CameraId is not valid')
    const images = await getAllImageByCameraId({ cameraId })
    return images
  }

  static async getImageByCameraIdAndTime({ cameraId, startTime, endTime }) {
    if (!cameraId) throw new BadRequestError('CameraId is required')
    if (!isValidObjectId(cameraId)) throw new BadRequestError('CameraId is not valid')
    if (!startTime) startTime = new Date(0)
    if (!endTime) endTime = new Date()
    if (startTime > endTime) throw new BadRequestError('Start time must be less than end time')
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) throw new BadRequestError('Invalid date')
    const images = await getImageByCameraIdAndTime({ cameraId, startTime, endTime })
    return images
  }

  static async getImageByCameraIdAndDate({ cameraId, date }) {
    if (!cameraId) throw new BadRequestError('CameraId is required')
    if (!isValidObjectId(cameraId)) throw new BadRequestError('CameraId is not valid')
    if (!date) throw new BadRequestError('Date is required')
    if (isNaN(new Date(date).getTime())) throw new BadRequestError('Invalid date')
    const images = await getImageByCameraIdAndDate({ cameraId, date })
    return images
  }
}

module.exports = ImageService
