'use strict'

const JWT = require('jsonwebtoken')
const asyncHandler = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError, BadRequestError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESH_TOKEN: 'x-rtoken-id'
}
const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '2 days'
    })
    const refreshToken = await JWT.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '7 days'
    })

    //
    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log('error verify::', err)
      } else {
        console.log('decode verify::', decode)
      }
    })
    return { accessToken, refreshToken }
  } catch (error) {
    return error
  }
}

const authentication = asyncHandler(async (req, res, next) => {
  /**
   * 1. Check userId missing?
   * 2. Get accessToken
   * 3. Verify token
   * 4. check user in db
   * 5. check keyStore with this userId
   * 6. Ok all => return next()
   */
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailureError('Invalid Request')

  //2
  const keyStore = await findByUserId(userId)
  if (!keyStore) throw new NotFoundError('Not found keyStore')

  //3
  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailureError('Invalid request')

  //4
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId')
    req.keyStore = keyStore
    return next()
  } catch (error) {
    throw error
  }
})

const authenticationV2 = asyncHandler(async (req, res, next) => {
  const clientId = req.headers[HEADER.CLIENT_ID]
  const refreshToken = extractToken(req.headers[HEADER.REFRESH_TOKEN])
  const accessToken = extractToken(req.headers[HEADER.AUTHORIZATION])
  // if (!clientId) throw new AuthFailureError('Invalid Request')

  // 1. check user id
  const obj = parseJwt(accessToken || refreshToken)
  if (!obj.userId) throw new BadRequestError('Invalid request')

  const userId = clientId || obj.userId
  if (!userId) throw new BadRequestError('Invalid request')

  //2
  const keyStore = await findByUserId(userId)
  if (!keyStore) throw new NotFoundError('Not found keyStore')

  //3
  if (req.headers[HEADER.REFRESH_TOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESH_TOKEN]
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
      if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId')
      req.keyStore = keyStore
      req.user = decodeUser
      req.refreshToken = refreshToken
      return next()
    } catch (error) {
      throw error
    }
  }

  if (!accessToken) throw new AuthFailureError('Invalid request')

  //4
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId')
    req.keyStore = keyStore
    req.user = decodeUser
    return next()
  } catch (error) {
    throw error
  }
})

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret)
}

const parseJwt = (token) => {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
}

const extractToken = (tokenHeader) => {
  if (!tokenHeader) return ''
  return tokenHeader.replace(HEADER.BEARER, '')
}

const isFarm = asyncHandler(async (req, res, next) => {
  if (req.user.roles.includes('FARM')) {
    return next()
  }
  throw new AuthFailureError('Permison denied!')
})

const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.roles.includes('ADMIN')) {
    return next()
  }
  throw new AuthFailureError('Permison denied!')
})

module.exports = {
  createTokenPair,
  authentication,
  authenticationV2,
  verifyJWT
}
