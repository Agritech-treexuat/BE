'use strict'

const CameraService = require('../services/camera.service')
const { SuccessResponse } = require('../core/success.response')

class CameraController {
  getCamerasInFarm = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all cameras success!',
      metadata: await CameraService.getCamerasInFarm({
        ...req.query,
        farmId: req.params.farmId
      })
    }).send(res)
  }

  getCameraById = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get camera by id success!',
      metadata: await CameraService.getCameraById({
        cameraId: req.params.cameraId
      })
    }).send(res)
  }

  addCamera = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add camera success!',
      metadata: await CameraService.addCamera({
        cameraData: req.body,
        farmId: req.user.userId
      })
    }).send(res)
  }

  updateCamera = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update camera success!',
      metadata: await CameraService.updateCamera({
        cameraId: req.params.cameraId,
        cameraData: req.body,
        farmId: req.user.userId
      })
    }).send(res)
  }

  deleteCamera = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete camera success!',
      metadata: await CameraService.deleteCamera({
        cameraId: req.params.cameraId,
        farmId: req.user.userId
      })
    }).send(res)
  }
}

module.exports = new CameraController()
