import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: "postgresql://postgres:saitama@localhost:5432/gym_db",
  },
  migrations: {
    seed: 'ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seeds/seed.ts',
  },
})