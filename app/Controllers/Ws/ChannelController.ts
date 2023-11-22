import { inject } from "@adonisjs/core/build/standalone";
import { ChannelRepositoryContract } from "@ioc:Repositories/ChannelRepository";
import { WsContextContract } from "@ioc:Ruby184/Socket.IO/WsContext";


@inject(['Repositories/ChannelRepository'])
export default class ChannelController {
    constructor (private channelRepository: ChannelRepositoryContract) {}

    public async getMembers({ params }: WsContextContract) {
        return this.channelRepository.getAllMembers(params.name)
    }
}
