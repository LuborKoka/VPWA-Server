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
