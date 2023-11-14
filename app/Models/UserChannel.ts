import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Channel from './Channel'

export default class UserChannel extends BaseModel {
    @column({ isPrimary: true })
    public id: string

    @column()
    public isUserBanned: boolean

    @column.dateTime({ autoCreate: true })
    public joinedAt: DateTime

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
