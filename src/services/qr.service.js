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
const { getClientById } = require('./client.service')
const { ethers } = require('ethers')

const abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'projectId',
        type: 'string'
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'privateId',
        type: 'string'
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'purchaseInfo',
        type: 'string'
      }
    ],
    name: 'ProductPurchased',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'projectId',
        type: 'string'
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'generateQRInfo',
        type: 'string'
      }
    ],
    name: 'QRGenerated',
    type: 'event'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'projectId',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'privateId',
        type: 'string'
      }
    ],
    name: 'checkProductStatus',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'projectId',
        type: 'string'
      },
      {
        internalType: 'uint256',
        name: 'numberOfQR',
        type: 'uint256'
      },
      {
        internalType: 'string[]',
        name: 'privateIds',
        type: 'string[]'
      },
      {
        internalType: 'string',
        name: 'generateQRInfo',
        type: 'string'
      }
    ],
    name: 'generateQR',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    name: 'projects',
    outputs: [
      {
        internalType: 'string',
        name: 'projectId',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'projectId',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'privateId',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'purchaseInfo',
        type: 'string'
      }
    ],
    name: 'purchaseProduct',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]

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

    const { amount, amountPerOne, distributerWithAmount } = outputData
    if (!amountPerOne) {
      throw new BadRequestError('Amount per one is required')
    }

    // map in distributerWithAmount and validate distributerId and amount, then quantity = amount / amountPerOne, then call exportQR
    let quantity = 0
    await Promise.all(
      distributerWithAmount.map(async (item) => {
        if (!isValidObjectId(item.distributer)) {
          throw new BadRequestError('Invalid distributer id')
        }
        if (!item.amount) {
          throw new BadRequestError('Amount is required')
        }
        // quantity = amount / amountPerOne (base)
        quantity = item.numberOfQR
        let privateIdsEachDistributer = item.privateIdsEachDistributer
        if (!privateIdsEachDistributer) {
          throw new BadRequestError('Private ids are required')
        }
        if (privateIdsEachDistributer.length !== quantity) {
          throw new BadRequestError('Private ids length must be equal to quantity')
        }
        await exportQR({
          projectId,
          outputId,
          distributerId: item.distributer,
          quantity,
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

    const clientItem = await getClientById({ clientId })
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

    const purchaseInfo = `${clientItem.name} with id ${clientItem._id.toString()} scan this product from distributer: ${
      qrItem.distributer.name
    }, farm: ${qrItem.project.farm.name} at ${new Date()}`

    // Khởi tạo provider của Ethereum (ví dụ: Infura)
    const provider = new ethers.providers.JsonRpcProvider('https://evmos-pokt.nodies.app')

    // Khởi tạo signer từ private key
    const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider)

    // Kết nối với smart contract thông qua contract address
    const contract = new ethers.Contract(process.env.QR_CONTRACT_ADDRESS, abi, wallet)

    // Kiểm tra xem QR đã được quét trên blockchain chưa
    const checkProductStatus = await contract.checkProductStatus(qrItem.project._id.toString(), qrItem.privateId)
    if (checkProductStatus) {
      return {
        message: 'QR is already scanned in blockchain',
        scannedQR: qrItem
      }
    }

    // Gửi giao dịch mua sản phẩm lên blockchain
    const transaction = await contract.purchaseProduct(qrItem.project._id.toString(), qrItem.privateId, purchaseInfo)

    // Chờ giao dịch được đào thành khối
    await transaction.wait()
    const txScan = transaction.hash

    // update output
    const scanQRItem = await scanQR({ qrId, txScan, clientId })
    if (!scanQRItem) {
      throw new BadRequestError('Scan QR failed')
    }

    return {
      txScan,
      client: clientItem,
      qrItem
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
