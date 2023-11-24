import { ChannelRepositoryContract, SerializedChannel, User } from "@ioc:Repositories/ChannelRepository";
import Channel from "App/Models/Channel";
import Invitation from "App/Models/Invitation";
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

    public async quit(channelName: string, username: string): Promise<unknown> {
        /**
         * @returns true if channel was deleted, else false
         */

        const user = await UserModel.findByOrFail('username', username)
        const channel = await Channel.findByOrFail('name', channelName)

        // if user is admin as well, delete the channel
        if ( user.id === channel.adminId ) {
            await channel.delete()
            return true
        }


        const userChannel = await UsersChannel.query()
            .where('user_id', user.id)
            .where('channel_id', channel.id)
            .firstOrFail()

        await userChannel.delete()

        return false
    }


    public async inviteToChannel(channelName: string, username: string, targetName: string): Promise<boolean> {
        const admin = await UserModel.findByOrFail('username', username)
        const channel = await Channel.findByOrFail('name', channelName)

        const isInvitationAllowed = channel.adminId === admin.id || !channel.isPrivate

        if ( isInvitationAllowed ) {
            const invitedUser = await UserModel.findByOrFail('username', targetName)
            await Invitation.create({channelId: channel.id, userId: invitedUser.id})
            return true
        }

        return false
    }

    public async revokeFromChannel(channelName: string, username: string, targetName: string): Promise<boolean> {
        //cant revoke yourself, use quit or cancel
        if ( username === targetName ) return false

        const channel = await Channel.findByOrFail('name', channelName)
        const owner = await UserModel.findByOrFail('username', username)

        if ( !channel.isPrivate ) return false
        if ( channel.adminId !== owner.id ) return false

        const target = await UserModel.findByOrFail('username', targetName)

        const targetToDelete = await UsersChannel.query()
            .where('user_id', target.id)
            .andWhere('channel_id', channel.id)
            .firstOrFail()

        await targetToDelete.delete()
        return true

    }
}
