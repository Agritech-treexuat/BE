'use strict'

const express = require('express')
const projectController = require('../../controllers/project.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

const router = express.Router()

router.get('/farm/:farmId', asyncHandler(projectController.getAllProjectsByFarm))
router.get('/:projectId/plantFarming', asyncHandler(projectController.getPlantFarming))
router.get(
  '/:projectId/processesWithObjectDetections',
  asyncHandler(projectController.getProcessesWithObjectDetections)
)

router.get('/:projectId/process', asyncHandler(projectController.getAllProcess))
router.get('/:projectId/expect', asyncHandler(projectController.getExpect))
router.get('/:projectId/output', asyncHandler(projectController.getOutput))
router.get('/:projectId/certificateImages', asyncHandler(projectController.getCertificateImages))
router.get('/:projectId/camera', asyncHandler(projectController.getCameraInProject))
router.get('/:projectIndex/cameraIndex', asyncHandler(projectController.getCameraIndexAndStartDateAndEndDate))
router.get('/:projectId/deletedItem', asyncHandler(projectController.getDeletedItemInProject))
router.get('/:projectId/connectionLoss', asyncHandler(projectController.getConnectionLossbyProject))
router.get('/:projectId/image', asyncHandler(projectController.getImageByProject))
router.get('/:projectId', asyncHandler(projectController.getProjectInfo))

// Authentication
router.use(authenticationV2)
////////////

router.post('/:projectId/plantFarming', asyncHandler(projectController.addPlantFarmingToProject))
router.post('/:projectId/process', asyncHandler(projectController.addProcess))
router.patch('/:projectId/process/:processId', asyncHandler(projectController.updateProcess))
router.delete('/:projectId/process/:processId', asyncHandler(projectController.deleteProcess))
router.post('/:projectId/expect', asyncHandler(projectController.addExpect))
router.patch('/:projectId/expect/:expectId', asyncHandler(projectController.updateExpect))
router.delete('/:projectId/expect/:expectId', asyncHandler(projectController.deleteExpect))
router.post('/:projectId/output', asyncHandler(projectController.addOutput))
router.patch('/:projectId/output/:outputId', asyncHandler(projectController.updateOutput))
router.delete('/:projectId/output/:outputId', asyncHandler(projectController.deleteOutput))
router.patch('/:projectId/certificateImages', asyncHandler(projectController.updateCertificateImages))
router.post('/', asyncHandler(projectController.initProject))
router.patch('/:projectId', asyncHandler(projectController.updateProjectInfo))
router.delete('/:projectId', asyncHandler(projectController.deleteProject))
router.patch('/:projectId/camera', asyncHandler(projectController.updateCameraToProject))

module.exports = router
