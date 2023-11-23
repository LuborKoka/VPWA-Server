import { ChannelRepositoryContract, SerializedChannel, User } from "@ioc:Repositories/ChannelRepository";
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

    public async create(channelName: string, username: string, isPrivate: boolean): Promise<SerializedChannel> {
        const admin = await UserModel.findByOrFail('username', username)
        const channel = await Channel.create({ adminId: admin.id, name: channelName, isPrivate: isPrivate})

        await UsersChannel.create({userId: admin.id, channelId: channel.id})

        return {
            id: channel.id,
            name: channel.name,
            isPrivate: channel.isPrivate,
            isMember: true
        }
    }

    public async delete(channelName: string, username: string): Promise<boolean> {
        const channel = await Channel.findByOrFail('name', channelName)
        const admin = await UserModel.findByOrFail('username', username)


        //chcelo by to vratit 401, ale tak co uz
        if ( channel.adminId !== admin.id ) return false

        await channel.delete()

        return true
    }
}
