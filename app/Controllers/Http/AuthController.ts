import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import UserChannel from 'App/Models/UserChannel'
import RegisterUserValidator from 'App/Validators/RegisterUserValidator'
import argon2 from 'phc-argon2'


export default class AuthController {
  async register({ request }: HttpContextContract) {
    // if invalid, exception
    const data = await request.validate(RegisterUserValidator)
    const hash = await argon2.hash_password(data.password)
    const user = await User.create({...data, password: hash})
    // join user to general channel
    //dorobit query, ktora zapise pouzivatela do general kanalu
    const general = await Channel.findByOrFail('name', 'General')
    //vyriesene
    await UserChannel.create({userId: user.id, channelId: general.id})

    //toto budeme musiet riesit inym sposobom, jest to novy riadok do users_channels, ale jebat lucid orm fakt
    //await user.related('channel').attach([general.id])
    const resultUser = {
        id: user.id,
        channels: [general.id],
    }

    return resultUser
  }

  async login({ auth, request }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    return auth.use('api').attempt(email, password)
  }

  async logout({ auth }: HttpContextContract) {
    return auth.use('api').logout()
  }

  async me({ auth }: HttpContextContract) {
    //get channels where the user is member
    //const channels =
   // await auth.user!.load('channels')
    return auth.user
  }
}
