'use strict'

const { farm } = require('../models/farm.model')
const bcrypt = require('bcrypt')
// const crypto = require('crypto')
const KeyTokenService = require('../services/keyToken.service')
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { getInfoData, sendEmail } = require('../utils')
const { BadRequestError, AuthFailureError, ForbiddenError, MethodFailureError } = require('../core/error.response')
const { findUserByEmail, getUser, addUser, updateUser, getPasswordHash } = require('./user.service')
const { client } = require('../models/client.model')
const { isValidObjectId } = require('../utils')
const crypto = require('node:crypto')

const Role = {
  FARM: 'FARM',
  CLIENT: 'CLIENT',
  WRITE: 'WRITE',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}

class AccessService {
  static signUp = async ({ name, email, password, role }) => {
    if (!email || !password || !role || !name) {
      throw new BadRequestError('Email, password, role, name are required')
    }
    // step 1: check email exists?
    const holderUser = await findUserByEmail({ email })
    if (holderUser) {
      throw new BadRequestError('Error: User already registered!')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const newUser = await addUser({ email, password: passwordHash, roles: [role] })
    if (role === Role.FARM || role === Role.ADMIN) {
      const newFarm = await farm.create({
        _id: newUser._id,
        name: name
      })

      if (!newFarm) throw new MethodFailureError('Farm registration failed')
    }

    if (role === Role.CLIENT) {
      const newClient = await client.create({
        _id: newUser._id,
        name: name
      })
      if (!newClient) throw new MethodFailureError('User registration failed')
    }

    // created privateKey, publicKey
    const privateKey = crypto.randomBytes(64).toString('hex')
    const publicKey = crypto.randomBytes(64).toString('hex')

    const keyStore = await KeyTokenService.createKeyToken({
      userId: newUser._id,
      publicKey,
      privateKey
    })

    if (!keyStore) {
      return {
        code: 'xxxx',
        message: 'keyStore error'
      }
    }

    // created token pair
    const tokens = await createTokenPair({ userId: newUser._id, email, roles: newUser.roles }, publicKey, privateKey)
    console.log(`Created Token Success::`, tokens)
    return {
      code: 201,
      metadata: {
        user: getInfoData({ fields: ['_id', 'email'], object: newUser }),
        tokens
      }
    }
  }

  /**
   * 1. check email in db
   * 2. match password
   * 3. create AT & RT and save
   * 4. generate tokens
   * 5. get data return login
   */
  static login = async ({ email, password, refreshToken = null }) => {
    const foundUser = await findUserByEmail({ email })
    if (!foundUser) throw new BadRequestError('Farm not registered')

    const match = await bcrypt.compare(password, foundUser.password)
    if (!match) throw new AuthFailureError('Authentication error')

    const privateKey = crypto.randomBytes(64).toString('hex')
    const publicKey = crypto.randomBytes(64).toString('hex')

    const { _id: userId } = foundUser
    const tokens = await createTokenPair({ userId, email, roles: foundUser.roles }, publicKey, privateKey)

    await KeyTokenService.createKeyToken({
      userId,
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey
    })

    return {
      metadata: {
        farm: getInfoData({ fields: ['_id', 'email', 'roles'], object: foundUser }),
        tokens
      }
    }
  }

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id)
    console.log({ delKey })
    return delKey
  }

  static getUser = async ({ userId }) => {
    const foundUser = await getUser({ userId })
    if (!foundUser) throw new BadRequestError('User not registered')

    return foundUser
  }

  /**
   * Check this token used?
   */
  static handlerRefreshToken = async (refreshToken) => {
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)

    //check xem token da duoc su dung chua?
    if (foundToken) {
      // decode xem may la thang nao?
      const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
      console.log({ userId, email })
      // xoa tat ca  token trong keyStore
      await KeyTokenService.deleteKeyById(userId)
      throw new ForbiddenError('Something wrong happened!! Pls re-login')
    }

    //
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
    if (!holderToken) throw new AuthFailureError('Farm not registered')

    // verify token
    const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
    console.log('[2]--', { userId, email })
    // check userId
    const foundFarm = await findUserByEmail({ email })
    if (!foundFarm) throw new AuthFailureError('Farm not registered')

    //create 1 cap moi
    const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey)

    //update token
    await holderToken
      .update({
        $set: {
          refreshToken: tokens.refreshToken
        },
        $addToSet: {
          refreshTokensUsed: refreshToken // da duoc su dung de lay token moi roi
        }
      })
      .exec()

    return {
      user: { userId, email },
      tokens
    }
  }

  static handlerRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
    const { userId, email } = user
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId)
      throw new ForbiddenError('Something wrong happened || Pls re-login')
    }

    if (keyStore.refreshToken !== refreshToken) throw new AuthFailureError('User not registered')

    const foundUser = await findUserByEmail({ email })
    if (!foundUser) throw new AuthFailureError('User not registered')

    // create 1 cap moi
    const tokens = await createTokenPair(
      { userId, email, roles: foundUser.roles },
      keyStore.publicKey,
      keyStore.privateKey
    )
    //update token
    await keyStore
      .update({
        $set: {
          refreshToken: tokens.refreshToken
        },
        $addToSet: {
          refreshTokensUsed: refreshToken // da duoc su dung de lay token moi roi
        }
      })
      .exec()

    return {
      user,
      tokens
    }
  }

  static forgotPassword = async ({ email }) => {
    const foundUser = await findUserByEmail({ email })
    if (!foundUser) throw new BadRequestError('User not registered')
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    const resetPasswordExpires = Date.now() + 10 * 60 * 1000
    const updatedUser = await updateUser({
      userId: foundUser._id,
      data: {
        resetPasswordToken,
        resetPasswordExpires
      }
    })
    if (!updatedUser) throw new MethodFailureError('Update user failed')

    const userType = foundUser.roles.includes(Role.FARM) ? 'farm' : 'client'
    await sendEmail({ email, resetToken, userType })
    return {
      message: 'Send verify email success'
    }
  }

  static resetPassword = async ({ resetToken, email, newPassword }) => {
    const foundUser = await findUserByEmail({ email })
    if (!foundUser) throw new BadRequestError('User not registered')
    if (foundUser.resetPasswordExpires < Date.now()) throw new BadRequestError('Token expired')
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    console.log('resetPasswordToken', resetPasswordToken)
    console.log('foundUser.resetPasswordToken', foundUser.resetPasswordToken)
    if (foundUser.resetPasswordToken !== resetPasswordToken) throw new BadRequestError('Token invalid')
    const passwordHash = await bcrypt.hash(newPassword, 10)
    const updatedUser = await updateUser({
      userId: foundUser._id,
      data: {
        password: passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    })
  }

  static updatePassword = async ({ userId, oldPassword, newPassword }) => {
    if (!userId || !oldPassword || !newPassword) {
      throw new BadRequestError('UserId, oldPassword, newPassword are required')
    }
    if (!isValidObjectId(userId)) {
      throw new BadRequestError('UserId is invalid')
    }
    const passwordHash = await getPasswordHash({ userId })
    if (!passwordHash) throw new BadRequestError('User not registered')
    const match = await bcrypt.compare(oldPassword, passwordHash)
    if (!match) throw new BadRequestError('Old password is not correct')
    const newPasswordHash = await bcrypt.hash(newPassword, 10)
    const updatedUser = await updateUser({
      userId: userId,
      data: {
        password: newPasswordHash
      }
    })
    if (!updatedUser) throw new MethodFailureError('Update user failed')
    return {
      message: 'Update password success'
    }
  }

  static testSendEmail = async () => {
    await sendEmail()
    return {
      data: 'Send email success'
    }
  }
}

module.exports = AccessService
