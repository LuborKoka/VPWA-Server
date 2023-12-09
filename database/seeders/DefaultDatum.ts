import Database from '@ioc:Adonis/Lucid/Database'

export default class DefaultDataSeeder {
  public async run () {
    await Database.raw(`
        insert into users (email, password, username, status)
        values ('-', '-', 'general_channel_owner', 'offline');

        insert into channels (name, admin_id)
        values ('General', (select id from users where username = 'general_channel_owner'));
    `)

  }
}
