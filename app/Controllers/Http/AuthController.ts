import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import Invitation from 'App/Models/Invitation'
import User from 'App/Models/User'
import UserChannel from 'App/Models/UserChannel'
import RegisterUserValidator from 'App/Validators/RegisterUserValidator'
import argon2 from 'phc-argon2'

type TInvitation = {
    id: string,
    channelName: string,
    createdAt: string
}


export default class AuthController {
  async register({ request }: HttpContextContract) {
    // if invalid, exception
    const data = await request.validate(RegisterUserValidator)
    //spytat sa tuto na ten hash
    const hash = await argon2.hash(data.password)
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = auth.user!

    //treba potom dokoncit este kanaly, kde ma user banan
    const result = await UserChannel.query()
        .distinctOn('channel_id')
        .select('channels.name', 'channels.is_private', 'users_channels.user_id')
        .rightJoin('channels', 'channels.id', 'users_channels.channel_id')
        .where('users_channels.user_id', user.id)
        .orWhere('channels.is_private', false)
        .orderBy('users_channels.channel_id')
        .exec()

    const invitationsResult = await Invitation.query()
        .select('invitations.id', 'invitations.created_at', 'channels.name', 'channels.is_private')
        .join('channels', 'invitations.channel_id', 'channels.id')
        .where('invitations.user_id', user.id)
        .exec()

    const channels = result.filter(r => !invitationsResult.some(i => i.$extras.name === r.$extras.name)).map((row) => ({
        name: encodeURIComponent(row.$extras.name),
        isPrivate: row.$extras.is_private,
        isMember: row.userId === user.id
    }))


    const invitations: TInvitation[] = invitationsResult.map(i => ({
        id: i.id,
        channelName: i.$extras.name,
        createdAt: String(i.createdAt),
        isPrivate: i.$extras.is_private
    }))


    const res = {
        username: user.username,
        id: user.id,
        status: user.status,
        isMuted: user.isMuted,
        email: user.email,
        channels,
        invitations
    }
    return res
  }
}


