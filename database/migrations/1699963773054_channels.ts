import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'channels'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.schema.raw('uuid_generate_v4()'))
            table.string('name', 32).notNullable().unique()
            table.boolean('is_private').defaultTo(false)
            table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
            table.uuid('admin_id').notNullable().references('users.id').onDelete('CASCADE')
            table.timestamps(true, true)
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
