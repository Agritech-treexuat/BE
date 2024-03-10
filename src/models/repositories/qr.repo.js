'use strict'

const { qr } = require('../qr.model')
const { Types } = require('mongoose')

const exportQR = async ({ projectId, outputId, distributerId, quantity, txExport, privateIdsEachDistributer }) => {
  // insert quantity qr document
  const qrData = []
  for (let i = 0; i < quantity; i++) {
    qrData.push({
      time: new Date(),
      isScanned: false,
      project: new Types.ObjectId(projectId),
      output: new Types.ObjectId(outputId),
      distributer: new Types.ObjectId(distributerId),
      txExport,
      privateId: privateIdsEachDistributer[i]
    })
  }
  return await qr.insertMany(qrData)
}

const getQRById = async (qrId) => {
  return await qr
    .findOne({ _id: new Types.ObjectId(qrId) })
    .populate('project')
    .populate({
      path: 'project',
      populate: {
        path: 'farm'
      }
    })
    .populate('distributer')
    .exec()
}

const scanQR = async ({ qrId, txScan, clientId }) => {
  return await qr.findOneAndUpdate(
    { _id: new Types.ObjectId(qrId) },
    { isScanned: true, timeScanned: new Date(), txScan, client: new Types.ObjectId(clientId) }
  )
}

const getQRByProject = async (projectId) => {
  return await qr
    .find({ project: new Types.ObjectId(projectId) })
    .populate('distributer')
    .exec()
}

module.exports = {
  exportQR,
  scanQR,
  getQRById,
  getQRByProject
}
