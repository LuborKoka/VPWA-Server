import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'votes'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.schema.raw('uuid_generate_v4()'))
            table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
            table.uuid('voter_id').notNullable().references('users.id').onDelete('NO ACTION')
            table.uuid('channel_id').notNullable().references('channels.id').onDelete('CASCADE')
            table.uuid('target_user_id').notNullable().references('users.id').onDelete('CASCADE')
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
