'use strict'
const FarmService = require('../services/farm.service')
const { SuccessResponse } = require('../core/success.response')

class FarmController {
  // get Farm
  getFarm = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get Farm success!',
      metadata: await FarmService.getFarm({ farmId: req.params.farmId })
    }).send(res)
  }

  // update Farm
  updateFarm = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update Farm success!',
      metadata: await FarmService.updateInfoFarm({ farmId: req.user.userId, farm: req.body })
    }).send(res)
  }

  // get all Farms
  getAllFarms = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all Farms success!',
      metadata: await FarmService.getAllFarms()
    }).send(res)
  }

  getDistributorsByFarmId = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get Distributors by FarmId success!',
      metadata: await FarmService.getDistributorsByFarmId({ farmId: req.params.farmId })
    }).send(res)
  }

  updateStatusFarm = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update status Farm success!',
      metadata: await FarmService.updateStatusFarm({ farmId: req.params.farmId, status: req.body.status })
    }).send(res)
  }

  updateWalletAddress = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update wallet address success!',
      metadata: await FarmService.updateWalletAddress({
        farmId: req.params.farmId,
        walletAddress: req.body.walletAddress
      })
    }).send(res)
  }
}

module.exports = new FarmController()
