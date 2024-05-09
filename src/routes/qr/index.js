'use strict'

const express = require('express')
const qrController = require('../../controllers/qr.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

const router = express.Router()

router.get('/project/:projectId', asyncHandler(qrController.getQRByProject))
router.get('/stats/:farmId', asyncHandler(qrController.getQRStatsByFarmId))

// Authentication
router.use(authenticationV2)
////////////

router.post('/export/:projectId/:outputId', asyncHandler(qrController.exportQR))
router.post('/scan', asyncHandler(qrController.scanQR))

module.exports = router
