// uuid 14 is ESM-only and Jest here runs CommonJS, so tests resolve "uuid" to this stub.
// The real package is still what ships in the bundle; only the test runner is redirected.
import { randomUUID } from 'crypto'

export const v4 = (): string => randomUUID()
