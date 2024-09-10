import db from 'src/sqlite'
const insert_message = db.prepare('insert into log(message,path,stack,create_date) values(?,?,?,?)')
export function messageLog(err: { message: string, path?: string, stack?: string }) {
  insert_message.run(err.message, err.path || '', err.stack || '', new Date().toLocaleDateString())
}