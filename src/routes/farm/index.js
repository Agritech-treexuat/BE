'use strict'
const express = require('express')
const farmController = require('../../controllers/farm.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2, isAdmin } = require('../../auth/authUtils')

const router = express.Router()

router.get('/distributors/:farmId', asyncHandler(farmController.getDistributorsByFarmId))
router.get('/:farmId', asyncHandler(farmController.getFarm))
router.get('/', asyncHandler(farmController.getAllFarms))
// Authentication
router.use(authenticationV2)
//////////

router.patch('/', asyncHandler(farmController.updateFarm))

router.patch('/:farmId/status', isAdmin, asyncHandler(farmController.updateStatusFarm))
router.patch('/:farmId/walletAddress', isAdmin, asyncHandler(farmController.updateWalletAddress))

module.exports = router
