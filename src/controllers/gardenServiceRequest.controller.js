'use strict'

const GardenServiceRequestService = require('../services/gardenServiceRequest.service')
const { SuccessResponse } = require('../core/success.response')

class GardenServiceRequestController {
  // add GardenServiceRequest
  addGardenServiceRequest = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new GardenServiceRequest success!',
      metadata: await GardenServiceRequestService.addGardenServiceRequest({
        gardenServiceRequestData: req.body,
        clientId: req.user.userId
      })
    }).send(res)
  }

  // update GardenServiceRequest
  updateGardenServiceRequest = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update GardenServiceRequest success!',
      metadata: await GardenServiceRequestService.updatedGardenServiceRequest({
        gardenServiceRequestId: req.params.gardenServiceRequestId,
        gardenServiceRequestData: req.body,
        clientId: req.user.userId
      })
    }).send(res)
  }

  // delete GardenServiceRequest
  deleteGardenServiceRequest = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete GardenServiceRequest success!',
      metadata: await GardenServiceRequestService.deleteGardenServiceRequest({
        gardenServiceRequestId: req.params.gardenServiceRequestId,
        clientId: req.user.userId
      })
    }).send(res)
  }

  // accept GardenServiceRequest
  acceptGardenServiceRequest = async (req, res, next) => {
    new SuccessResponse({
      message: 'Accept GardenServiceRequest success!',
      metadata: await GardenServiceRequestService.acceptGardenServiceRequest({
        gardenServiceRequestId: req.params.gardenServiceRequestId,
        farmid: req.user.userId
      })
    }).send(res)
  }

  // reject GardenServiceRequest
  rejectGardenServiceRequest = async (req, res, next) => {
    new SuccessResponse({
      message: 'Reject GardenServiceRequest success!',
      metadata: await GardenServiceRequestService.rejectGardenServiceRequest({
        gardenServiceRequestId: req.params.gardenServiceRequestId,
        farmid: req.user.userId
      })
    }).send(res)
  }

  // QUERY //

  getAllGardenServiceRequestsByFarm = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get list getAllGardenServiceRequestsByFarm success!',
      metadata: await GardenServiceRequestService.getAllGardenServiceRequestsByFarm({
        farmId: req.params.farmId,
        ...req.query
      })
    }).send(res)
  }

  getAllGardenServiceRequestsWaitingByFarm = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get list getAllGardenServiceRequestsWaitingByFarm success!',
      metadata: await GardenServiceRequestService.getAllGardenServiceRequestsWaitingByFarm({
        farmId: req.params.farmId,
        ...req.query
      })
    }).send(res)
  }

  getAllGardenServiceRequestsAcceptedByFarm = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get list getAllGardenServiceRequestsAcceptedByFarm success!',
      metadata: await GardenServiceRequestService.getAllGardenServiceRequestsAcceptedByFarm({
        farmId: req.params.farmId,
        ...req.query
      })
    }).send(res)
  }

  getAllGardenServiceRequestsRejectedByFarm = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get list getAllGardenServiceRequestsRejectedByFarm success!',
      metadata: await GardenServiceRequestService.getAllGardenServiceRequestsRejectedByFarm({
        farmId: req.params.farmId,
        ...req.query
      })
    }).send(res)
  }

  getGardenServiceRequestByGardenServiceRequestId = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get GardenServiceRequest success!',
      metadata: await GardenServiceRequestService.getGardenServiceRequestByGardenServiceRequestId({
        gardenServiceRequestId: req.params.gardenServiceRequestId
      })
    }).send(res)
  }
}

module.exports = new GardenServiceRequestController()
