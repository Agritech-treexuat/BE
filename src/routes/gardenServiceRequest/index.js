'use strict'

const express = require('express')
const gardenServiceRequestController = require('../../controllers/gardenServiceRequest.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

const router = express.Router()

router.get(
  '/farm/:farmId/waiting',
  asyncHandler(gardenServiceRequestController.getAllGardenServiceRequestsWaitingByFarm)
)
router.get(
  '/farm/:farmId/accepted',
  asyncHandler(gardenServiceRequestController.getAllGardenServiceRequestsAcceptedByFarm)
)
router.get(
  '/farm/:farmId/rejected',
  asyncHandler(gardenServiceRequestController.getAllGardenServiceRequestsRejectedByFarm)
)
router.get('/farm/:farmId', asyncHandler(gardenServiceRequestController.getAllGardenServiceRequestsByFarm))
router.get(
  '/:gardenServiceRequestId',
  asyncHandler(gardenServiceRequestController.getGardenServiceRequestByGardenServiceRequestId)
)

// Authentication
router.use(authenticationV2)
////////////
router.post('/', asyncHandler(gardenServiceRequestController.addGardenServiceRequest))
router.patch('/:gardenServiceRequestId', asyncHandler(gardenServiceRequestController.updateGardenServiceRequest))
router.delete('/:gardenServiceRequestId', asyncHandler(gardenServiceRequestController.deleteGardenServiceRequest))
router.patch('/:gardenServiceRequestId/accept', asyncHandler(gardenServiceRequestController.acceptGardenServiceRequest))
router.patch('/:gardenServiceRequestId/reject', asyncHandler(gardenServiceRequestController.rejectGardenServiceRequest))

module.exports = router
