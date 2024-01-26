'use strict'

const express = require('express')
const gardenServiceTemplateController = require('../../controllers/gardenServiceTemplate.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

const router = express.Router()

router.get('/farm/:farmId', asyncHandler(gardenServiceTemplateController.getAllGardenServiceTemplatesByFarm))
router.get(
  '/:gardenServiceTemplateId',
  asyncHandler(gardenServiceTemplateController.getGardenServiceTemplateByGardenServiceTemplateId)
)

// Authentication
router.use(authenticationV2)
////////////
router.post('/', asyncHandler(gardenServiceTemplateController.addGardenServiceTemplate))
router.patch('/:gardenServiceTemplateId', asyncHandler(gardenServiceTemplateController.updateGardenServiceTemplate))
router.delete('/:gardenServiceTemplateId', asyncHandler(gardenServiceTemplateController.deleteGardenServiceTemplate))

module.exports = router
