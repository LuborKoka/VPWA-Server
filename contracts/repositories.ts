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
      getAll(channelName: string): Promise<SerializedMessage[]>
      create(channelName: string, userId: string, content: string): Promise<SerializedMessage>
    }

    const MessageRepository: MessageRepositoryContract
    export default MessageRepository
  }


declare module '@ioc:Repositories/ChannelRepository' {
    export interface SerializedChannel {
        id: string,
        name: string,
        isPrivate: boolean,
        isMember: true
    }

    export interface User {
        username: string,
        status: string,
    }

    export interface ChannelRepositoryContract {
        getAllMembers(channelName: string): Promise<User[]>
        joinChannel(channelName: string, username: string): Promise<void>
        create(channelName: string, username: string, isPrivate: boolean): Promise<SerializedChannel>,
        delete(channelName: string, username: string): Promise<boolean>
    }

    const ChannelRepository: ChannelRepositoryContract
    export default ChannelRepository
}
