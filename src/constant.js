const admin_id = '65bf53967517b61da58eaaba'
const incognito_client_id = '664310c52d7c3b1df08253d7'

qr_abi = [
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

module.exports = { admin_id, incognito_client_id, qr_abi }
