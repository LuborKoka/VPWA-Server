import { inject } from "@adonisjs/core/build/standalone";
import { ChannelRepositoryContract } from "@ioc:Repositories/ChannelRepository";
import { WsContextContract } from "@ioc:Ruby184/Socket.IO/WsContext";


@inject(['Repositories/ChannelRepository'])
export default class ChannelController {
    constructor (private channelRepository: ChannelRepositoryContract) {}

    public async getMembers({ params }: WsContextContract) {
        return this.channelRepository.getAllMembers(decodeURIComponent(params.name))
    }

    public async joinChannel({ params }: WsContextContract, username: string) {
        return this.channelRepository.joinChannel(decodeURIComponent(params.name), username)
    }

    public async createChannel({ params}: WsContextContract, username: string, isPrivate: boolean) {
        //treba dorobit broadcast pre vsetkych ak je public channel
        return this.channelRepository.create(decodeURIComponent(params.name), username, isPrivate)
    }

    public async deleteChannel({ params }: WsContextContract, username: string) {
        // dorobit broadcast pre vsetkych v channeli
        return this.channelRepository.delete(decodeURIComponent(params.name), username)
    }

    public async quitChannel({ params }: WsContextContract, username: string ) {
        return this.channelRepository.quit(decodeURIComponent(params.name), username)
    }

    public async inviteToChannel({ params }: WsContextContract, username: string, targetName: string) {
        //poslat dotycnemu ten invite na klienta
        return this.channelRepository.inviteToChannel(decodeURIComponent(params.name), username, targetName)
    }

    public async revokeFromChannel({ params }: WsContextContract, username: string, targetName: string) {
        return this.channelRepository.revokeFromChannel(decodeURIComponent(params.name), username, targetName)
    }
}
