import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Channel from './Channel'
import Message from './Message'

export default class Ping extends BaseModel {
    @column({ isPrimary: true })
    public id: string

    @column()
    public userId: string

    @column()
    public channelId: string

    @column()
    public messageId: string

    @belongsTo(() => User, {
        foreignKey: 'userId',
        localKey: 'id'
    })
    public user: BelongsTo<typeof User>

    @belongsTo(() => Channel, {
        foreignKey: 'channelId',
        localKey: 'id'
    })
    public channel: BelongsTo<typeof Channel>

    @belongsTo(() => Message, {
        foreignKey: 'messageId',
        localKey: 'id'
    })
    public message: BelongsTo<typeof Message>
}
