import { D1Dialect } from 'kysely-d1';
import {
  Kysely,
  Migrator,
} from 'kysely'
import { requireContext } from './oneshot.server';

export interface ProjectsTable {
  id: string,
  name: string,
  description?: string,
  user_id: string,
  created_at: string,
  updated_at: string,
}

export interface UsersTable {
  id: string,
  name: string,
  email?: string,
  created_at: string,
  updated_at: string,
}

export interface FilesTable {
  id: string,
  project_id: string,
  name: string,
  code: string,
  lang: string,
  entrypoint: 0 | 1,
  created_at: string,
  updated_at: string,
}

export interface Database {
  projects: ProjectsTable,
  files: FilesTable,
  users: UsersTable,
}

async function migrateToLatest(db: Kysely<Database>) {
  const migrator = new Migrator({
    db,
    provider: {
      async getMigrations() {
        return {
          "init_tables": {
            up: async (db) => {
              await db.schema
                .createTable('users')
                .addColumn('id', 'text', (col) => col.primaryKey())
                .addColumn('name', 'text', (col) => col.notNull())
                .addColumn('email', 'text')
                .addColumn('created_at', 'text', (col) => col.notNull())
                .addColumn('updated_at', 'text', (col) => col.notNull())
                .execute()

              await db.schema
                .createTable('projects')
                .addColumn('id', 'text', (col) => col.primaryKey())
                .addColumn('user_id', 'text', (col) => col.references('users.id'))
                .addColumn('name', 'text', (col) => col.notNull())
                .addColumn('description', 'text')
                .addColumn('created_at', 'text', (col) => col.notNull())
                .addColumn('updated_at', 'text', (col) => col.notNull())
                .execute()

              await db.schema
                .createTable('files')
                .addColumn('id', 'text', (col) => col.primaryKey())
                .addColumn('project_id', 'text', (col) => col.references('projects.id'))
                .addColumn('name', 'text', (col) => col.notNull())
                .addColumn('code', 'text', (col) => col.notNull())
                .addColumn('lang', 'text', (col) => col.notNull())
                .addColumn('entrypoint', 'boolean', (col) => col.defaultTo(false).notNull())
                .addColumn('created_at', 'text', (col) => col.notNull())
                .addColumn('updated_at', 'text', (col) => col.notNull())
                .execute()
            },
            down: async (db) => {
              await db.schema.dropTable('files').execute()
              await db.schema.dropTable('projects').execute()
            }
          }
        }
      },
    }
  })

  const { error, results } = await migrator.migrateToLatest()
  if (error) throw error
  console.log("Migrating...", results, error);
}

export async function database() {
  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: requireContext().DB }),
  });
  await migrateToLatest(db)
  return db
}

export function generateDatabaseId(): string {
  // copied from nanoid
  let nanoid = (size = 21) =>
    crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
      byte &= 63
      if (byte < 36) {
        id += byte.toString(36)
      } else if (byte < 62) {
        id += (byte - 26).toString(36).toUpperCase()
      } else if (byte > 62) {
        id += '-'
      } else {
        id += '_'
      }
      return id
    }, '')

  return nanoid()
}