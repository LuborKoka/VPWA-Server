// here we are declaring our MessageRepository types for Repositories/MessageRepository


// container binding. See providers/AppProvider.ts for how we are binding the implementation
declare module '@ioc:Repositories/MessageRepository' {
    export interface SerializedMessage {
        senderId: string,
        senderName: string,
        content: string,
        createdAt: string,
        id: string
    }

    export interface MessageRepositoryContract {
      getAll(channelName: string, userId: string): Promise<SerializedMessage[]>
      create(channelName: string, userId: string, content: string): Promise<SerializedMessage | string>
    }

    const MessageRepository: MessageRepositoryContract
    export default MessageRepository
  }


declare module '@ioc:Repositories/ChannelRepository' {
    export interface SerializedChannel {
        id: string,
        name: string,
        isPrivate: boolean,
        isMember: boolean
    }

    export interface User {
        username: string,
        status: string,
    }

    export interface ChannelRepositoryContract {
        getAllMembers(channelName: string, username: string): Promise<User[] | string>
        joinChannel(channelName: string, username: string, isPrivate: boolean): Promise<SerializedChannel>
        create(channelName: string, username: string, isPrivate: boolean): Promise<SerializedChannel>,
        delete(channelName: string, username: string): Promise<boolean | string>
        quit(channelName: string, username: string): Promise<SerializedChannel | string>
        inviteToChannel(channelName: string, username: string, targetName: string): Promise<boolean | string>
        revokeFromChannel(channelName: string, username: string, targetName: string): Promise<boolean | string>
        handleInvite(channelName: string, userId: string, accepted: boolean, inviteId: string): Promise<SerializedChannel>
    }

    const ChannelRepository: ChannelRepositoryContract
    export default ChannelRepository
}
