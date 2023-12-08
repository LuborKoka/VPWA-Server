/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { inject } from "@adonisjs/core/build/standalone";
import { ChannelRepositoryContract } from "@ioc:Repositories/ChannelRepository";
import { WsContextContract } from "@ioc:Ruby184/Socket.IO/WsContext";


@inject(['Repositories/ChannelRepository'])
export default class ChannelController {
    constructor (private channelRepository: ChannelRepositoryContract) {}

    public async getMembers({ params, auth }: WsContextContract) {
        return this.channelRepository.getAllMembers(decodeURIComponent(params.name), auth.user!.username)
    }

    public async joinChannel({ params, auth }: WsContextContract, isPrivate: boolean) {
        return this.channelRepository.joinChannel(decodeURIComponent(params.name), auth.user!.username, isPrivate)
    }

    public async createChannel({ params, auth }: WsContextContract, isPrivate: boolean) {
        return this.channelRepository.create(decodeURIComponent(params.name), auth.user!.username, isPrivate)
    }

    public async deleteChannel({ params }: WsContextContract, username: string) {
        return this.channelRepository.delete(decodeURIComponent(params.name), username)
    }

    public async quitChannel({ params, auth }: WsContextContract) {
        return this.channelRepository.quit(decodeURIComponent(params.name), auth.user!.username)
    }

    public async inviteToChannel({ params }: WsContextContract, username: string, targetName: string) {
        return this.channelRepository.inviteToChannel(decodeURIComponent(params.name), username, targetName)
    }

    public async revokeFromChannel({ params }: WsContextContract, username: string, targetName: string) {
        return this.channelRepository.revokeFromChannel(decodeURIComponent(params.name), username, targetName)
    }

    public async handleInvite({ params, auth }: WsContextContract, inviteId: string, accepted: boolean) {
        return this.channelRepository.handleInvite(decodeURIComponent(params.name), auth.user!.id, accepted, inviteId)
    }
}
