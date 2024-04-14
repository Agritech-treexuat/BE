'use strict'
const QRService = require('../services/qr.service')
const { SuccessResponse } = require('../core/success.response')

class QRController {
  // export QR
  exportQR = async (req, res, next) => {
    new SuccessResponse({
      message: 'Export QR success!',
      metadata: await QRService.exportQR({
        projectId: req.params.projectId,
        outputId: req.params.outputId,
        outputData: req.body,
        farmId: req.user.userId,
        txExport: req.body.txExport
      })
    }).send(res)
  }

  // scan QR
  scanQR = async (req, res, next) => {
    new SuccessResponse({
      message: 'Scan QR success!',
      metadata: await QRService.scanQR({
        privateId: req.body.privateId,
        projectId: req.body.projectId,
        clientId: req.user.userId
      })
    }).send(res)
  }

  // get QR by project
  getQRByProject = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get QR by project success!',
      metadata: await QRService.getQRByProject({
        projectId: req.params.projectId
      })
    }).send(res)
  }
}

module.exports = new QRController()
