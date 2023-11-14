import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
    @column({ isPrimary: true })
    public id: string

    @column()
    public email: string

    @column()
    public password: string

    @column()
    public nickName: string

    @column()
    public isMuted: boolean

    @column()
    public status: string
}
