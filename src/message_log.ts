import { insert_message } from 'src/sqlite'

export function messageLog(err: { message: string, path?: string, stack?: string }) {
  insert_message.run(err.message, err.path || '', err.stack || '', new Date().toLocaleDateString())
}