import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Channel from './Channel'

export default class Vote extends BaseModel {
    @column({ isPrimary: true })
    public id: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column()
    public targetUserId: string

    @column()
    public voterId: string

    @column()
    public channelId: string

    @belongsTo(() => User, {
        foreignKey: 'targetUserId',
        localKey: 'id'
    })
    public targetUser: BelongsTo<typeof User>

    @belongsTo(() => User, {
        foreignKey: 'voterId',
        localKey: 'id'
    })
    public voter: BelongsTo<typeof User>

    @belongsTo(() => Channel, {
        foreignKey: 'channelId',
        localKey: 'id'
    })
    public channel: BelongsTo<typeof Channel>
}
