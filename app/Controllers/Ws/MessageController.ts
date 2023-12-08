/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import type { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import { inject } from '@adonisjs/core/build/standalone'
import Channel from 'App/Models/Channel'
import { isUserMemberOfChannel } from 'App/Repositories/ChannelRepository'

// inject repository from container to controller constructor
// we do so because we can extract database specific storage to another class
// and also to prevent big controller methods doing everything
// controler method just gets data (validates it) and calls repository
// also we can then test standalone repository without controller
// implementation is bind into container inside providers/AppProvider.ts
@inject(['Repositories/MessageRepository'])
export default class MessageController {
    constructor (private messageRepository: MessageRepositoryContract) {}

    public async loadMessages({ params, auth }: WsContextContract) {
        return this.messageRepository.getAll(decodeURIComponent(params.name), auth.user!.id)
    }

    public async addMessage({ params, socket, auth }: WsContextContract, content: string) {
        const message = await this.messageRepository.create(decodeURIComponent(params.name), auth.user!.id, content)
        // broadcast message to other users in channel
        socket.broadcast.emit('message', message)
        // return message to sender
        return message
    }

    public async unsentMessage({ params, socket, auth }: WsContextContract, content: string) {
        const channel = await Channel.findByOrFail('name', params.name)
        if ( await isUserMemberOfChannel(auth.user!.id, channel.id) === false ) return

        const message = {
            sender: auth.user?.username,
            content: content
        }

        socket.broadcast.emit('unsentMessage', message)
        return message
    }
}
