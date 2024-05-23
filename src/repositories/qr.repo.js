'use strict'

const { qr } = require('../models/qr.model')
const { Types } = require('mongoose')
const md5 = require('md5')

const exportQR = async ({ projectId, outputId, distributerId, txExport, privateIdsEachDistributer }) => {
  const qrData = []
  for (let i = 0; i < privateIdsEachDistributer.length; i++) {
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

const getQRByPrivateIdAndProjectId = async ({ privateId, projectId }) => {
  const md5HashPrivateId = md5(privateId)
  return await qr
    .findOne({ privateId: md5HashPrivateId, project: new Types.ObjectId(projectId) })
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

const getAllQRsByFarmId = async ({ projects }) => {
  try {
    // Find all QRs associated with the projects
    const qrs = await qr.find({ project: { $in: projects.map((p) => p._id) } })

    return qrs
  } catch (error) {
    throw new Error('Error getting QRs by farmId: ' + error.message)
  }
}

module.exports = {
  exportQR,
  scanQR,
  getQRById,
  getQRByProject,
  getQRByPrivateIdAndProjectId,
  getAllQRsByFarmId
}
