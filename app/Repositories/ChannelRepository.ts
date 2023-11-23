import { ChannelRepositoryContract, User } from "@ioc:Repositories/ChannelRepository";
import Channel from "App/Models/Channel";
import UserModel from "App/Models/User";
import UsersChannel from "App/Models/UserChannel";


export default class ChannelRepository implements ChannelRepositoryContract {
    public async getAllMembers(name: string) {
        const result = await Channel.query()
            .select('users.username', 'users.status')
            .join('users_channels', 'users_channels.channel_id', 'channels.id')
            .join('users', 'users_channels.user_id', 'users.id')
            .where('channels.name', name)

        const users: User[] = await result.map(r => ({
            username: r.$extras.username,
            status: r.$extras.status
        }))

        return users
    }

    public async joinChannel(channelName: string, username: string): Promise<void> {
        const user = await UserModel.findByOrFail('username', username)
        const channel = await Channel.findByOrFail('name', channelName)
        await UsersChannel.create({ userId: user.id, channelId: channel.id})

        return
    }

    public async create(channelName: string, adminId: string): Promise<void> {
        //treba dorobit
        channelName
        adminId
    }
}
