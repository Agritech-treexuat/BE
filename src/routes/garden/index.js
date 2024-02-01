'use strict'

const express = require('express')
const gardenController = require('../../controllers/garden.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

const router = express.Router()

router.get('/farm/:farmId', asyncHandler(gardenController.getAllGardensByFarm))
router.get('/:gardenId/plantFarming/:projectId', asyncHandler(gardenController.getProjectPlantFarmingByGarden))
router.get('/:gardenId/process/:projectId', asyncHandler(gardenController.getProjectProcessByGarden))
router.get('/:gardenId/projects', asyncHandler(gardenController.getProjectsInfoByGarden))
router.get('/:gardenId/clientRequest', asyncHandler(gardenController.getClientRequestsByGarden))
router.get('/:gardenId/delivery', asyncHandler(gardenController.getDeliveriesByGarden))
router.get('/:gardenId', asyncHandler(gardenController.getGardenById))

// Authentication
router.use(authenticationV2)
////////////

router.patch('/:gardenId', asyncHandler(gardenController.updateGardenStatus))
router.post('/:gardenId/addNewProject', asyncHandler(gardenController.addNewProjectToGarden))
router.post('/:gardenId/delivery', asyncHandler(gardenController.addDelivery))
router.patch('/:gardenId/delivery/:deliveryId', asyncHandler(gardenController.updateDelivery))
router.delete('/:gardenId/delivery/:deliveryId', asyncHandler(gardenController.deleteDelivery))

router.post('/:gardenId/request', asyncHandler(gardenController.addClientRequest))
router.patch('/:gardenId/request/:clientRequestId', asyncHandler(gardenController.updateClientRequest))
router.delete('/:gardenId/request/:clientRequestId', asyncHandler(gardenController.deleteClientRequest))

module.exports = router