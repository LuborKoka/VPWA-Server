import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Channel from './Channel'

export default class Message extends BaseModel {
    @column({ isPrimary: true })
    public id: string

    @column()
    public content: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column()
    public userId: string

    @column()
    public channelId: string

    @belongsTo(() => User, {
        foreignKey: 'userId',
        localKey: 'id',
    })
    public user: BelongsTo<typeof User>

    @belongsTo(() => Channel, {
        foreignKey: 'channelId',
        localKey: 'id',
    })
    public channel: BelongsTo<typeof Channel>
}
