const { Types } = require('mongoose')
const { getAllCameras, getCameraById, addCamera, updateCamera, deleteCamera } = require('../repositories/camera.repo')
const { MethodFailureError, BadRequestError, NotFoundError } = require('../core/error.response')
const { isValidObjectId } = require('../utils')
const { update } = require('lodash')

class CameraService {
  static async getCamerasInFarm({ limit, sort, page, farmId } = {}) {
    const filter = { farm: new Types.ObjectId(farmId) }
    const cameras = await getAllCameras({ limit, sort, page, filter })
    return cameras
  }

  static async getCameraById({ cameraId }) {
    if (!cameraId) throw new BadRequestError('Camera id is required')
    if (!isValidObjectId(cameraId)) {
      throw new BadRequestError('Invalid camera id')
    }

    const foundCamera = await getCameraById({ cameraId })
    if (!foundCamera) {
      throw new NotFoundError('Camera not found')
    }

    return foundCamera
  }

  static async addCamera({ cameraData, farmId }) {
    if (!farmId) throw new BadRequestError('Farm id is required')
    if (!isValidObjectId(farmId)) {
      throw new BadRequestError('Invalid farm id')
    }
    if (!cameraData) throw new BadRequestError('Camera data is required')
    const { name, rtsp_link, cameraIndex, tx } = cameraData
    if (!name) {
      throw new BadRequestError('Camera name are required')
    }
    if (!rtsp_link) {
      throw new BadRequestError('Camera rtsp link is required')
    }
    if (!cameraIndex && cameraIndex !== 0) {
      throw new BadRequestError('Camera index is required')
    }
    if (!tx) {
      throw new BadRequestError('Camera tx is required')
    }
    const newCamera = await addCamera({
      cameraData: {
        farm: new Types.ObjectId(farmId),
        name,
        rtsp_link,
        cameraIndex,
        tx
      }
    })
    if (!newCamera) {
      throw new MethodFailureError('Failed to add camera')
    }
    return newCamera
  }

  static async updateCamera({ cameraId, cameraData, farmId }) {
    if (!cameraId) throw new BadRequestError('Camera id is required')
    if (!isValidObjectId(cameraId)) {
      throw new BadRequestError('Invalid camera id')
    }
    if (!cameraData) throw new BadRequestError('Camera data is required')

    const foundCamera = await getCameraById({ cameraId })
    if (!foundCamera) {
      throw new NotFoundError('Camera not found')
    }

    if (foundCamera.farm._id.toString() !== farmId) {
      throw new BadRequestError('Camera does not belong to this farm')
    }

    const { _id, farm, cameraIndex, tx, ...updateData } = cameraData

    const updatedCamera = await updateCamera({ cameraId, cameraData: updateData })
    if (!updatedCamera) {
      throw new MethodFailureError('Failed to update camera')
    }

    return updatedCamera
  }

  static async deleteCamera({ cameraId, farmId }) {
    if (!cameraId) throw new BadRequestError('Camera id is required')
    if (!isValidObjectId(cameraId)) {
      throw new BadRequestError('Invalid camera id')
    }

    const foundCamera = await getCameraById({ cameraId })
    if (!foundCamera) {
      throw new NotFoundError('Camera not found')
    }

    if (foundCamera.farm._id.toString() !== farmId) {
      throw new BadRequestError('Camera does not belong to this farm')
    }

    const deletedCamera = await deleteCamera({ cameraId })
    if (!deletedCamera) {
      throw new MethodFailureError('Failed to delete camera')
    }

    return deletedCamera
  }
}

module.exports = CameraService
