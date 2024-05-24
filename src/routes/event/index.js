'use strict'

const express = require('express')
const eventController = require('../../controllers/event.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

const router = express.Router()

router.get('/farm/:farmId', asyncHandler(eventController.getEventsByFarmId))
router.get('/:eventId', asyncHandler(eventController.getEventById))
router.get('/', asyncHandler(eventController.getAllEvents))

router.use(authenticationV2)

module.exports = router
