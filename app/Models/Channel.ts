import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Channel extends BaseModel {
    @column({ isPrimary: true })
    public id: string

    @column()
    public name: string

    @column()
    public isPrivate: boolean

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column()
    public adminId: string

    @belongsTo(() => User, {
        foreignKey: 'adminId',
        localKey: 'id',
    })
    public admin: BelongsTo<typeof User>
}
