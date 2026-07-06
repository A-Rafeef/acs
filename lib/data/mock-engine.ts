import fs from 'fs'
import path from 'path'

const MOCK_DB_PATH = path.join(process.cwd(), 'lib', 'data', 'mock-db.json')

export function isMockMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const forceMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
  return forceMock || !url || url.includes('your-supabase')
}

export function readMockDb() {
  try {
    const data = fs.readFileSync(MOCK_DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    console.error('Failed to read mock db:', err)
    return { categories: [], brands: [], products: [], waitlist: [] }
  }
}

export function writeMockDb(data: any) {
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('Failed to write mock db:', err)
    return false
  }
}
