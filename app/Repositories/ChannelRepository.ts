import { ChannelRepositoryContract, SerializedChannel, User } from "@ioc:Repositories/ChannelRepository";
import Channel from "App/Models/Channel";
import InvitationModel from "App/Models/Invitation";
import UserModel from "App/Models/User";
import UsersChannel from "App/Models/UserChannel";
import { onlineUsersMap, onlineUsersMap as users } from "App/Controllers/Ws/ActivityController";

export default class ChannelRepository implements ChannelRepositoryContract {
    public async getAllMembers(channelName: string, username: string) {
        const user = await UserModel.findByOrFail('username', username)
        const channel = await Channel.findByOrFail('name', channelName)
        const isMember = await isUserMemberOfChannel(user.id, channel.id)

        if ( isMember === false ) return 'Failed to get channel members. You are not a member of this channel.'

        const result = await Channel.query()
            .select('users.username', 'users.status')
            .join('users_channels', 'users_channels.channel_id', 'channels.id')
            .join('users', 'users_channels.user_id', 'users.id')
            .where('channels.name', channelName)

        const users: User[] = await result.map(r => ({
            username: r.$extras.username,
            status: onlineUsersMap.get(r.$extras.username) === undefined ? 'offline' : r.$extras.status
        }))

        return users
    }

    public async joinChannel(channelName: string, username: string, isPrivate: boolean) {
        const user = await UserModel.findByOrFail('username', username)
        const channel = await Channel.findBy('name', channelName)
        if ( channel === null ) {
            return this.create(channelName, username, isPrivate)
        }
        if ( channel.isPrivate )
            return 'You need an invitation to join a private channel.'

        try {
            await UsersChannel.create({ userId: user.id, channelId: channel.id})
        } catch (e) {
            if ( e?.constraint === 'unique_user_channel' )
                return 'You are a member of this channel already.'

            return 'Something went south like Sherman'
        }

        return {
            id: channel.id,
            name: channel.name,
            isPrivate: channel.isPrivate,
            isMember: true
        }
    }

    public async create(channelName: string, username: string, isPrivate: boolean ) {
        const admin = await UserModel.findByOrFail('username', username)
        let channel: Channel

        try {
            channel = await Channel.create({ adminId: admin.id, name: channelName, isPrivate: isPrivate})
        } catch (e) {
            if ( e?.constraint === 'channels_name_key' )
                return 'A channel with that name already exists.'
            return 'Something went south like Sherman.'
        }

        await UsersChannel.create({userId: admin.id, channelId: channel.id})

        const createdChannel = {
            id: channel.id,
            name: channel.name,
            isPrivate: channel.isPrivate,
            isMember: true
        }

        if ( channel.isPrivate === false )
            onlineUsersMap.forEach(u => {
                if ( u.data.username !== username ) u.emit('channelCreated', createdChannel)
        })

        return createdChannel
    }

    public async delete(channelName: string, username: string) {
        const channel = await Channel.findByOrFail('name', channelName)
        const user = await UserModel.findByOrFail('username', username)

        const isMember = await isUserMemberOfChannel(user.id, channel.id)

        if ( isMember === false ) return 'Failed to delete.  are not a member of this channel.'

        //chcelo by to vratit 403, ale tak co uz
        if ( channel.adminId !== user.id ) return 'Failed to delete. You are not the admin of this channel.'

        await channel.delete()

        onlineUsersMap.forEach(u => {
            if ( u.data.username !== username ) u.emit('channelDeleted', channel.name)
        })

        return true
    }

     /**
     * @returns true if channel was deleted, else false
     */
    public async quit(channelName: string, username: string) {
        const user = await UserModel.findByOrFail('username', username)
        const channel = await Channel.findByOrFail('name', channelName)

        const isMember = await isUserMemberOfChannel(user.id, channel.id)

        if ( isMember === false ) return 'Failed to quit. You are not a member of this channel.'

        // if user is admin as well, delete the channel
        if ( user.id === channel.adminId ) {
            await channel.delete()

            onlineUsersMap.forEach(u => {
                if ( u.data.username !== username ) u.emit('channelDeleted', channel.name)
            })
            return {
                id: channel.id,
                isMember: false,
                isPrivate: channel.isPrivate,
                name: channel.name
            }
        }


        const userChannel = await UsersChannel.query()
            .where('user_id', user.id)
            .where('channel_id', channel.id)
            .firstOrFail()

        await userChannel.delete()

        return {
            id: channel.id,
            isMember: false,
            isPrivate: channel.isPrivate,
            name: channel.name
        }
    }


    public async inviteToChannel(channelName: string, username: string, targetName: string): Promise<boolean | string> {
        const user = await UserModel.findByOrFail('username', username)
        const channel = await Channel.findByOrFail('name', channelName)

        const isMember = await isUserMemberOfChannel(user.id, channel.id)

        if ( isMember === false ) return 'Failed to invite a user. You are not a member of this channel.'

        const isInvitationAllowed = channel.adminId === user.id || !channel.isPrivate

        if ( !isInvitationAllowed ) return false


        const invitedUser = await UserModel.findByOrFail('username', targetName)

        if ( await isUserMemberOfChannel(invitedUser.id, channel.id) === true )
            return 'Failed to invite. The user is already a member of this channel.'

        let newInv: InvitationModel

        try {
            newInv = await InvitationModel.create({channelId: channel.id, userId: invitedUser.id})

        } catch (e) {
            if ( e?.constraint === 'unique_user_channel_invitation' )
                return 'An invitation for this user exists.'

            return 'Something went south like Sherman.'
        }

        const inv = {
            id: newInv.id,
            createdAt: String(newInv.createdAt),
            isPrivate: channel.isPrivate,
            channelName: channel.name
        }

        const userSocket = users.get(targetName)

        if ( userSocket ) {
            userSocket.emit('channelInvitation', inv)
        }

        return true

    }

    public async revokeFromChannel(channelName: string, username: string, targetName: string) {
        const channel = await Channel.findByOrFail('name', channelName)
        const user = await UserModel.findByOrFail('username', username)

        if ( await isUserMemberOfChannel(user.id, channel.id) === false ) return 'Failed to revoke. You are not a member of this channel.'

        //cant revoke yourself, use quit or cancel
        if ( username === targetName ) return 'You can\'t revoke yourself. Use /cancel command.'

        if ( !channel.isPrivate ) return false
        if ( channel.adminId !== user.id ) return false

        const target = await UserModel.findByOrFail('username', targetName)

        const targetToDelete = await UsersChannel.query()
            .where('user_id', target.id)
            .andWhere('channel_id', channel.id)
            .firstOrFail()

        await targetToDelete.delete()

        const deletedFromChannel: SerializedChannel = {
            id: channel.id,
            name: channel.name,
            isPrivate: channel.isPrivate,
            isMember: false
        }

        onlineUsersMap.forEach(u => {
            if ( u.data.username === targetName ) u.emit('revoke', deletedFromChannel)
        })
        return true

    }

    public async handleInvite(channelName: string, userId: string, accepted: boolean, inviteId: string) {
        const invite = await InvitationModel.findByOrFail('id', inviteId)
        const channel = await Channel.findByOrFail('name', channelName)
        if ( accepted ) {
            await UsersChannel.create({ userId: userId, channelId: channel.id})
            const res: SerializedChannel = {
                id: channel.id,
                name: channel.name,
                isPrivate: channel.isPrivate,
                isMember: true
            }
            await invite.delete()
            return res
        }

        await invite.delete()
        return {
            id: channel.id,
            name: channel.name,
            isPrivate: channel.isPrivate,
            isMember: false
        }
    }
}



export async function isUserMemberOfChannel(userId: string, channelId: string) {
    const userChannel = await UsersChannel.query()
        .where('user_id', userId)
        .andWhere('channel_id', channelId)

    //is not member
    if ( userChannel.length === 0 ) return false

    return true
}
