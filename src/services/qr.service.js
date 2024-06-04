const { Types } = require('mongoose')
const {
  exportQR,
  scanQR,
  getQRById,
  getQRByProject,
  getQRByPrivateIdAndProjectId,
  getAllQRsByFarmId
} = require('../repositories/qr.repo')
const { BadRequestError } = require('../core/error.response')
const { isValidObjectId } = require('../utils')
const { getProjectInfo, updateExportQR, getAllProjectsByFarm } = require('./project.service')
const { getOnlyClientById } = require('./client.service')
const { ethers } = require('ethers')
const { qr_abi } = require('../constant')

class QRService {
  static async exportQR({ farmId, projectId, outputId, outputData, txExport }) {
    if (!projectId) {
      throw new BadRequestError('Project id is required')
    }
    if (!isValidObjectId(projectId)) {
      throw new BadRequestError('Invalid project id')
    }
    if (!outputId) {
      throw new BadRequestError('Output id is required')
    }
    if (!isValidObjectId(outputId)) {
      throw new BadRequestError('Invalid output id')
    }
    if (!outputData) {
      throw new BadRequestError('Output data is required')
    }

    // check if farm has permission to export QR
    if (!farmId) {
      throw new BadRequestError('Farm id is required')
    }
    if (!isValidObjectId(farmId)) {
      throw new BadRequestError('Invalid farm id')
    }

    if (!txExport) {
      throw new BadRequestError('Tx export is required')
    }

    // check if project exists
    const projectItem = await getProjectInfo({ projectId, select: 'farm' })
    if (!projectItem) {
      throw new BadRequestError('Project not found')
    }
    if (projectItem.farm._id.toString() !== farmId) {
      throw new BadRequestError('Farm does not have permission to export QR')
    }

    const { distributerWithAmount } = outputData

    await Promise.all(
      distributerWithAmount.map(async (item) => {
        if (!isValidObjectId(item.distributer)) {
          throw new BadRequestError('Invalid distributer id')
        }

        let privateIdsEachDistributer = item.privateIdsEachDistributer
        if (!privateIdsEachDistributer || privateIdsEachDistributer.length === 0) {
          throw new BadRequestError('Private ids are required')
        }
        await exportQR({
          projectId,
          outputId,
          distributerId: item.distributer,
          txExport,
          privateIdsEachDistributer
        })
      })
    )

    await updateExportQR({ projectId, outputId })
    return true
  }

  static async scanQR({ privateId, projectId, clientId }) {
    // Kiểm tra và xác thực dữ liệu đầu vào
    if (!privateId) {
      throw new BadRequestError('Private id is required')
    }
    if (!projectId || !isValidObjectId(projectId)) {
      throw new BadRequestError('Invalid project id')
    }
    if (!clientId || !isValidObjectId(clientId)) {
      throw new BadRequestError('Invalid client id')
    }

    const clientItem = await getOnlyClientById({ clientId })
    if (!clientItem) {
      throw new BadRequestError('Client not found')
    }

    // Lấy thông tin QR từ privateId va projectId
    // find qr by privateId (use hash md5 to compare privateId in database) and projectId
    const qrItem = await getQRByPrivateIdAndProjectId({ privateId, projectId })

    if (!qrItem) {
      throw new BadRequestError('QR not found')
    }

    if (qrItem.isScanned) {
      return {
        message: 'QR is already scanned',
        scannedQR: qrItem
      }
    }

    const timeScanned = new Date()

    const purchaseInfo = `${clientItem.name} with id ${clientItem._id.toString()} scan this product, farm: ${
      qrItem.project.farm.name
    } at ${timeScanned}`

    // Khởi tạo provider của Ethereum (ví dụ: Infura)
    const provider = new ethers.providers.JsonRpcProvider('https://evmos-pokt.nodies.app')

    // Khởi tạo signer từ private key
    const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider)

    // Kết nối với smart contract thông qua contract address
    const contract = new ethers.Contract(process.env.QR_CONTRACT_ADDRESS, qr_abi, wallet)

    // Kiểm tra xem QR đã được quét trên blockchain chưa
    const checkProductStatus = await contract.checkProductStatus(qrItem.project._id.toString(), qrItem.privateId)
    if (checkProductStatus) {
      return {
        message: 'QR is already scanned',
        scannedQR: qrItem
      }
    }

    // Gửi giao dịch mua sản phẩm lên blockchain
    const transaction = await contract.purchaseProduct(qrItem.project._id.toString(), qrItem.privateId, purchaseInfo)

    // Chờ giao dịch được đào thành khối
    await transaction.wait()
    const txScan = transaction.hash

    // update output
    const scanQRItem = await scanQR({ qrId: qrItem._id.toString(), txScan, clientId, purchaseInfo, timeScanned })
    if (!scanQRItem) {
      throw new BadRequestError('Scan QR failed')
    }

    clientItem.history.push({
      qr: qrItem._id,
      time: timeScanned,
      purchaseInfo
    })

    await clientItem.save()

    return {
      txScan,
      timeScanned: timeScanned,
      client: clientItem,
      qrItem,
      purchaseInfo
    }
  }

  static async getQRByProject({ projectId }) {
    if (!projectId || !isValidObjectId(projectId)) {
      throw new BadRequestError('Invalid project id')
    }

    const qrItems = await getQRByProject(projectId)
    return qrItems
  }

  static async getQRStatsByFarmId({ farmId }) {
    try {
      const projects = await getAllProjectsByFarm({ farmId })
      if (!projects || projects.length === 0) {
        return { totalQRCount: 0, scannedQRCount: 0 }
      }
      const allQRs = await getAllQRsByFarmId({ projects }) // Get all QRs by farmId

      if (!allQRs || allQRs.length === 0) {
        return { totalQRCount: 0, scannedQRCount: 0 }
      }

      // Count the total number of QRs
      const totalQRCount = allQRs.length

      // Count the number of scanned QRs
      const scannedQRCount = allQRs.filter((qr) => qr.isScanned).length

      return { totalQRCount, scannedQRCount }
    } catch (error) {
      throw new Error('Error getting QR stats by farmId: ' + error.message)
    }
  }
}

module.exports = QRService
