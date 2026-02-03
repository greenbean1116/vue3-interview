/**
 * 使用者表格資料 - 模擬資料產生
 * 包含 100 筆使用者記錄，用於表格元件練習
 */

export interface User {
  id: number
  name: string
  email: string
  age: number
  city: string
  joinDate: string
  status: 'active' | 'inactive' | 'pending'
  department: string
}

const cities = ['北京', '上海', '廣州', '深圳', '杭州', '南京', '成都', '西安', '武漢', '重慶']
const departments = ['前端', '後端', '設計', '產品', '運維', '測試', '營運']
const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending']

const firstNames = [
  '張',
  '李',
  '王',
  '趙',
  '劉',
  '陳',
  '楊',
  '黃',
  '周',
  '吳',
  '徐',
  '孫',
  '馬',
  '朱',
  '林',
  '高',
  '何',
  '郭',
  '斌',
  '羅',
]

const lastNames = [
  '明',
  '芳',
  '偉',
  '峰',
  '華',
  '傑',
  '欣',
  '軍',
  '敏',
  '靜',
  '超',
  '強',
  '浩',
  '岩',
  '斌',
  '慧',
  '俊',
  '鵬',
  '飛',
  '濤',
]

/**
 * 產生隨機使用者
 */
function generateMockUsers(count: number = 100): User[] {
  const users: User[] = []

  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)] || ''
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)] || ''
    const name = firstName + lastName

    const year = 2018 + Math.floor(Math.random() * 6)
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')

    users.push({
      id: i,
      name,
      email: `${name.toLowerCase()}_${i}@example.com`,
      age: Math.floor(Math.random() * 40) + 22,
      city: cities[Math.floor(Math.random() * cities.length)] || '',
      joinDate: `${year}-${month}-${day}`,
      status: statuses[Math.floor(Math.random() * statuses.length)] as
        | 'active'
        | 'inactive'
        | 'pending',
      department: departments[Math.floor(Math.random() * departments.length)] || '',
    })
  }

  return users
}

export const mockUsers: User[] = generateMockUsers(100)

/**
 * 取得指定數量的使用者資料
 */
export function getUserData(count: number = 100): User[] {
  return generateMockUsers(count)
}

/**
 * 取得城市清單
 */
export function getCities(): string[] {
  return cities
}

/**
 * 取得部門清單
 */
export function getDepartments(): string[] {
  return departments
}

/**
 * 取得狀態清單
 */
export function getStatuses() {
  return statuses
}

/**
 * 模擬 API 呼叫 - 取得使用者清單
 * @param params 查詢參數
 */
export function fetchUsers(params: {
  page?: number
  pageSize?: number
  search?: string
  city?: string
  department?: string
  status?: string
  ageMin?: number
  ageMax?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}): Promise<{ data: User[]; total: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let result = [...mockUsers]

      // 搜尋
      if (params.search) {
        const search = params.search.toLowerCase()
        result = result.filter(
          (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search),
        )
      }

      // 城市篩選
      if (params.city) {
        result = result.filter((u) => u.city === params.city)
      }

      // 部門篩選
      if (params.department) {
        result = result.filter((u) => u.department === params.department)
      }

      // 狀態篩選
      if (params.status) {
        result = result.filter((u) => u.status === params.status)
      }

      // 年齡範圍篩選
      if (params.ageMin !== undefined) {
        result = result.filter((u) => u.age >= params.ageMin!)
      }
      if (params.ageMax !== undefined) {
        result = result.filter((u) => u.age <= params.ageMax!)
      }

      // 排序
      if (params.sortBy) {
        result.sort((a, b) => {
          const aVal = a[params.sortBy as keyof User]
          const bVal = b[params.sortBy as keyof User]

          if (aVal < bVal) return params.sortOrder === 'asc' ? -1 : 1
          if (aVal > bVal) return params.sortOrder === 'asc' ? 1 : -1
          return 0
        })
      }

      const total = result.length

      // 分頁
      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize

      resolve({
        data: result.slice(start, end),
        total,
      })
    }, 300) // 模擬網路延遲
  })
}
