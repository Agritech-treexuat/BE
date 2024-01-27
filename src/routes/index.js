'use strict'

const express = require('express')
const { apiKey, permission } = require('../auth/checkAuth')
const router = express.Router()

// // check apiKey
// router.use(apiKey)
// // check permission
// router.use(permission('0000'))

router.use('/v1/api/plant', require('./plant'))
router.use('/v1/api/product', require('./product'))
router.use('/v1/api/seed', require('./seed'))
router.use('/v1/api/plantFarming', require('./plantFarming'))
router.use('/v1/api/project', require('./project'))
router.use('/v1/api/gardenServiceTemplate', require('./gardenServiceTemplate'))
router.use('/v1/api/gardenServiceRequest', require('./gardenServiceRequest'))
router.use('/v1/api', require('./access'))

module.exports = router
