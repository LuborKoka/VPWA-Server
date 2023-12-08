import type { MessageRepositoryContract, SerializedMessage } from '@ioc:Repositories/MessageRepository'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'
import User from 'App/Models/User'
import { isUserMemberOfChannel } from './ChannelRepository'

export default class MessageRepository implements MessageRepositoryContract {
    public async getAll(channelName: string, userId: string) {
        //treba pridat check, ci je user clenom kanalu
        const channel = await Channel.findByOrFail('name', channelName)

        if ( await isUserMemberOfChannel(userId, channel.id) === false ) return []

        const messages = await Message.query()
            .select('messages.content', 'messages.id', 'messages.created_at', 'messages.user_id', 'users.username')
            .join('users', 'messages.user_id', 'users.id')
            .where('messages.channel_id', channel.id)
            .orderBy('messages.created_at')
            .exec()

        return messages.map( m => ({
            content: m.content,
            senderId: m.userId,
            senderName: m.$extras.username,
            createdAt: String(m.createdAt),
            id: m.id
        }) as SerializedMessage)
      }

  public async create(channelName: string, userId: string, content: string) {
    //treba pridat check, ci je user clenom kanalu
    const channel = await Channel.findByOrFail('name', channelName)
    const user = await User.findByOrFail('id', userId)

    if ( await isUserMemberOfChannel(userId, channel.id) === false )
        return 'Failed to send message. You are not a member of this channel.'


    const message = await Message.create({content: content, userId: userId, channelId: channel.id})


    const resMessage: SerializedMessage = {
        senderId: userId,
        senderName: user.username,
        content: content,
        createdAt: String(message.createdAt),
        id: message.id
    }

    return resMessage
  }
}
