import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'pings'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
        table.uuid('id').primary().defaultTo(this.schema.raw('uuid_generate_v4()'))
        table.uuid('user_id').notNullable().references('users.id').onDelete('CASCADE')
        table.uuid('channel_id').notNullable().references('channels.id').onDelete('CASCADE')
        table.uuid('message_id').notNullable().references('messages.id').onDelete('CASCADE')
        table.timestamps(true, true)
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
