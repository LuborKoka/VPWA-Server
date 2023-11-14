import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'users'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.schema.raw('uuid_generate_v4()'))
            table.string('email', 100).notNullable().unique()
            table.string('password', 72).notNullable()
            table.string('nick_name', 32).notNullable().unique()
            table.boolean('is_muted').defaultTo(false)
            table.string('status', 7).notNullable().defaultTo('online')
            table.timestamps(true, true)
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
