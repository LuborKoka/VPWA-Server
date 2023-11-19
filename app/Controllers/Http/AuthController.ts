import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import UserChannel from 'App/Models/UserChannel'
import RegisterUserValidator from 'App/Validators/RegisterUserValidator'


export default class AuthController {
  async register({ request }: HttpContextContract) {
    // if invalid, exception
    const data = await request.validate(RegisterUserValidator)
    const user = await User.create({...data})
    // join user to general channel
    //dorobit query, ktora zapise pouzivatela do general kanalu
    const general = await Channel.findByOrFail('name', 'General')
    //vyriesene
    await UserChannel.create({userId: user.id, channelId: general.id})

    //toto budeme musiet riesit inym sposobom, jest to novy riadok do users_channels, ale jebat lucid orm fakt
    //await user.related('channel').attach([general.id])
    const resultUser = {
        id: user.id,
        channels: [{id: general.id, title: general.name, isPublic: false}],
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
    // await auth.user!.load('channels')
    const result = await UserChannel.query()
            .select('channels.name', 'channels.isPrivate')
            .innerJoin('channels', 'channels.id', 'users_channels.channelId')
            .exec()


    const channels = result.map((row) => ({
        name: row.$extras.channel_name,
        isPrivate: row.$extras.channel_is_private
    }))

    //toto musi byt dokoncene, az pojde ten login, asi vratim noveho usera
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //auth.user!.channels = channels
    return auth.user
  }
}


