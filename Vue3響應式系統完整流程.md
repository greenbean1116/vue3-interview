# Vue 3 響應式系統完整流程

## 目錄

1. [響應式對象的創建](#1-響應式對象的創建)
2. [Proxy 攔截機制](#2-proxy-攔截機制)
3. [依賴收集系統](#3-依賴收集系統)
4. [Watch 的完整流程](#4-watch-的完整流程)
5. [深度監聽的實現](#5-深度監聽的實現)
6. [更新調度機制](#6-更新調度機制)
7. [完整流程圖](#7-完整流程圖)

---

## 1. 響應式對象的創建

### 1.1 ref 的內部實現

```typescript
// ref 的源碼簡化版本
class RefImpl<T> {
  private _value: T
  public dep?: Dep = undefined
  public readonly __v_isRef = true

  constructor(
    value: T,
    public readonly __v_isShallow: boolean,
  ) {
    // 關鍵：如果不是淺層 ref，value 會被 toReactive 轉換
    this._value = __v_isShallow ? value : toReactive(value)
  }

  get value() {
    // GET 攔截：收集依賴
    trackRefValue(this)
    return this._value
  }

  set value(newVal) {
    // SET 攔截：觸發更新
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = this.__v_isShallow ? newVal : toReactive(newVal)
      triggerRefValue(this)
    }
  }
}

// toReactive 的核心邏輯
function toReactive<T>(value: T): T {
  return isObject(value) ? reactive(value) : value
}

// ref 函數
function ref<T>(value: T) {
  return new RefImpl(value, false) // shallow = false
}

// shallowRef 函數
function shallowRef<T>(value: T) {
  return new RefImpl(value, true) // shallow = true
}
```

**ref 的關鍵點：**

1. ref 本身是一個 `RefImpl` 類實例，並非 Proxy
2. 通過 `getter/setter` 攔截 `.value` 的訪問
3. 如果 value 是對象，會調用 `toReactive(value)` → 其實就是 `reactive(value)`
4. **所以 ref 的 value 如果是對象，確實是用 reactive 包裝的**

### 1.2 reactive 的內部實現

```typescript
// reactive 的源碼簡化版本
function reactive<T extends object>(target: T): UnwrapNestedRefs<T> {
  // 如果已經是 readonly 或已經是 reactive，直接返回
  if (isReadonly(target)) {
    return target
  }
  return createReactiveObject(
    target,
    false, // isReadonly
    mutableHandlers, // 普通對象的 Proxy handlers
    mutableCollectionHandlers, // Map/Set 的 Proxy handlers
    reactiveMap, // 緩存 Map
  )
}

function shallowReactive<T extends object>(target: T): T {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers, // 淺層 handlers
    shallowCollectionHandlers,
    shallowReactiveMap,
  )
}

// 創建響應式對象的核心函數
function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>,
) {
  // 1. 檢查 target 是否已經被代理過（避免重複代理）
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  // 2. 創建 Proxy
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers,
  )

  // 3. 緩存 Proxy（target → proxy 的映射）
  proxyMap.set(target, proxy)

  return proxy
}
```

**reactive 的關鍵點：**

1. reactive 直接返回 Proxy 對象
2. 使用 WeakMap 緩存已創建的 Proxy，避免重複創建
3. 對於嵌套對象，是**惰性代理**（lazy proxy）

---

## 2. Proxy 攔截機制

### 2.1 深層 reactive 的 Handlers

```typescript
// mutableHandlers - 用於 reactive()
const mutableHandlers: ProxyHandler<object> = {
  get(target: Target, key: string | symbol, receiver: object) {
    // 特殊 key 的處理（__v_isReactive, __v_isReadonly 等）
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    // 獲取原始值
    const res = Reflect.get(target, key, receiver)

    // 依賴收集
    track(target, TrackOpTypes.GET, key)

    // 如果是對象，遞歸包裝為 reactive（惰性代理）
    if (isObject(res)) {
      return reactive(res) // 關鍵：嵌套對象在訪問時才會被代理
    }

    return res
  },

  set(target: object, key: string | symbol, value: unknown, receiver: object) {
    const oldValue = (target as any)[key]

    // 設置新值
    const result = Reflect.set(target, key, value, receiver)

    // 觸發更新
    if (hasChanged(value, oldValue)) {
      trigger(target, TriggerOpTypes.SET, key, value, oldValue)
    }

    return result
  },

  deleteProperty(target: object, key: string | symbol) {
    const hadKey = hasOwn(target, key)
    const oldValue = (target as any)[key]
    const result = Reflect.deleteProperty(target, key)

    if (result && hadKey) {
      trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue)
    }

    return result
  },

  // has, ownKeys 等其他攔截...
}
```

### 2.2 淺層 reactive 的 Handlers

```typescript
// shallowReactiveHandlers - 用於 shallowReactive()
const shallowReactiveHandlers = {
  ...mutableHandlers,
  get(target: Target, key: string | symbol, receiver: object) {
    const res = Reflect.get(target, key, receiver)

    // 依賴收集
    track(target, TrackOpTypes.GET, key)

    // 關鍵：不會遞歸包裝，直接返回原始值
    return res
  },
}
```

**Proxy 攔截的關鍵點：**

1. **惰性代理（Lazy Proxy）**：嵌套對象只有在被訪問時才會被包裝為 reactive
2. 每次 `get` 都會調用 `track()` 收集依賴
3. 每次 `set` 都會調用 `trigger()` 觸發更新
4. shallowReactive 只代理第一層，不遞歸包裝

---

## 3. 依賴收集系統

### 3.1 全局數據結構

```typescript
// 全局變量：當前正在執行的 effect
let activeEffect: ReactiveEffect | undefined

// 全局變量：存儲所有依賴關係的 Map
// WeakMap<target, Map<key, Set<ReactiveEffect>>>
type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

// Dep 是一個 Set<ReactiveEffect>
type Dep = Set<ReactiveEffect>
```

**數據結構圖示：**

```
targetMap (WeakMap)
├── target1 (原始對象)
│   └── depsMap (Map)
│       ├── key1 → Set([effect1, effect2])
│       ├── key2 → Set([effect1])
│       └── key3 → Set([effect3])
├── target2 (原始對象)
│   └── depsMap (Map)
│       ├── keyA → Set([effect1])
│       └── keyB → Set([effect2, effect3])
```

### 3.2 track 函數 - 依賴收集

```typescript
// 依賴收集的核心函數
function track(target: object, type: TrackOpTypes, key: unknown) {
  // 如果沒有 activeEffect，說明不在響應式上下文中，不需要收集
  if (!activeEffect || !shouldTrack) {
    return
  }

  // 1. 從 targetMap 中獲取 target 對應的 depsMap
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  // 2. 從 depsMap 中獲取 key 對應的 dep（Set）
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  // 3. 將當前 activeEffect 加入 dep
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    // 雙向記錄：effect 也記錄它依賴的 dep
    activeEffect.deps.push(dep)
  }
}
```

### 3.3 trigger 函數 - 觸發更新

```typescript
// 觸發更新的核心函數
function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
) {
  // 1. 獲取 target 對應的 depsMap
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    // 從來沒有被追蹤過
    return
  }

  // 2. 收集需要執行的 effects
  const effects = new Set<ReactiveEffect>()

  // 獲取 key 對應的 deps
  const dep = depsMap.get(key)
  if (dep) {
    dep.forEach((effect) => {
      // 避免無限循環：如果當前正在執行這個 effect，不要再次觸發
      if (effect !== activeEffect) {
        effects.add(effect)
      }
    })
  }

  // 特殊情況：如果是數組的 length 變化，需要觸發所有索引相關的 effects
  if (type === TriggerOpTypes.SET && key === 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      if (key === 'length' || key >= (newValue as number)) {
        dep.forEach((effect) => effects.add(effect))
      }
    })
  }

  // 3. 執行所有收集到的 effects
  const run = (effect: ReactiveEffect) => {
    if (effect.options.scheduler) {
      // 如果有 scheduler，使用 scheduler 調度執行
      effect.options.scheduler(effect)
    } else {
      // 否則直接執行
      effect()
    }
  }

  effects.forEach(run)
}
```

---

## 4. Watch 的完整流程

### 4.1 watch 的源碼簡化

```typescript
function watch<T>(
  source: WatchSource<T> | WatchSource<T>[],
  cb: WatchCallback<T>,
  options?: WatchOptions,
): WatchStopHandle {
  return doWatch(source, cb, options)
}

function doWatch(
  source: WatchSource | WatchSource[] | WatchEffect | object,
  cb: WatchCallback | null,
  { immediate, deep, flush }: WatchOptions = {},
): WatchStopHandle {
  // 1. 規範化 source 為 getter 函數
  let getter: () => any

  if (isRef(source)) {
    // 情況1: watch(refObject, callback)
    getter = () => source.value
  } else if (isReactive(source)) {
    // 情況2: watch(reactiveObject, callback)
    getter = () => source
    deep = true // 關鍵：reactive 對象預設深度監聽
  } else if (isFunction(source)) {
    // 情況3: watch(() => xxx, callback)
    getter = () => source()
  } else {
    getter = () => {}
  }

  // 2. 如果是深度監聽，包裝 getter
  if (deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter()) // 遍歷所有屬性
  }

  // 3. 保存舊值
  let oldValue: any

  // 4. 創建 scheduler（調度器）
  let scheduler: (job: () => void) => void
  if (flush === 'sync') {
    scheduler = (job) => job() // 同步執行
  } else if (flush === 'post') {
    scheduler = (job) => queuePostFlushCb(job) // 組件更新後執行
  } else {
    // 默認 'pre'：組件更新前執行
    scheduler = (job) => {
      if (!instance || instance.isMounted) {
        queuePreFlushCb(job)
      } else {
        job() // 組件還沒掛載，直接執行
      }
    }
  }

  // 5. 創建 ReactiveEffect
  const effect = new ReactiveEffect(getter, scheduler)

  // 6. 執行 effect（收集依賴）
  if (immediate) {
    // 立即執行回調
    scheduler(() => {
      const newValue = effect.run()
      cb(newValue, oldValue)
      oldValue = newValue
    })
  } else {
    // 只執行 getter 收集依賴，不執行回調
    oldValue = effect.run()
  }

  // 7. 返回 stop 函數
  return () => {
    effect.stop()
  }
}
```

### 4.2 ReactiveEffect 類

```typescript
class ReactiveEffect<T = any> {
  active = true
  deps: Dep[] = [] // 這個 effect 依賴的所有 dep

  constructor(
    public fn: () => T, // getter 函數
    public scheduler: ((job: () => void) => void) | null = null,
  ) {}

  run() {
    if (!this.active) {
      return this.fn()
    }

    // 關鍵步驟：設置全局 activeEffect
    const parent = activeEffect
    activeEffect = this

    try {
      // 清理舊的依賴
      cleanupEffect(this)
      // 執行 fn，觸發依賴收集
      return this.fn()
    } finally {
      // 恢復之前的 activeEffect
      activeEffect = parent
    }
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)
      this.active = false
    }
  }
}
```

### 4.3 Watch 的執行時序

```
創建 watch
  ↓
doWatch(source, cb, options)
  ↓
規範化 source 為 getter
  ↓
創建 ReactiveEffect(getter, scheduler)
  ↓
執行 effect.run() ← 收集依賴的關鍵步驟
  ↓
設置 activeEffect = effect
  ↓
執行 getter()
  ↓
訪問響應式數據（觸發 Proxy get）
  ↓
track(target, key) → dep.add(activeEffect)
  ↓
依賴收集完成，activeEffect = undefined
  ↓
等待數據變化...
  ↓
數據改變（觸發 Proxy set）
  ↓
trigger(target, key)
  ↓
查找 targetMap[target][key] 的所有 effects
  ↓
執行 effect.scheduler(effect)
  ↓
將 effect 加入更新隊列
  ↓
nextTick 時執行隊列中的所有 effects
  ↓
執行 callback(newValue, oldValue)
```

---

## 5. 深度監聽的實現

### 5.1 traverse 函數 - 遍歷所有屬性

```typescript
// 遞歸遍歷對象的所有屬性，觸發所有 getter
function traverse(value: unknown, seen: Set<unknown> = new Set()) {
  // 1. 基礎類型直接返回
  if (!isObject(value)) {
    return value
  }

  // 2. 防止循環引用
  if (seen.has(value)) {
    return value
  }
  seen.add(value)

  // 3. 如果是 ref，遍歷 .value
  if (isRef(value)) {
    traverse(value.value, seen)
  }
  // 4. 如果是 reactive 對象，遍歷所有屬性
  else if (isReactive(value)) {
    // 遍歷對象的所有 key
    for (const key in value) {
      traverse((value as any)[key], seen) // 遞歸遍歷
    }

    // 遍歷數組的所有元素
    if (isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        traverse(value[i], seen)
      }
    }
  }

  return value
}
```

### 5.2 深度監聽的依賴收集過程

**場景：`watch(reactiveObject, callback)`**

```typescript
const state = reactive({
  user: {
    profile: {
      name: 'John',
      age: 30,
    },
  },
})

watch(state, (newVal, oldVal) => {
  console.log('state changed')
})
```

**依賴收集過程：**

```
1. 創建 watch
   ↓
2. 因為 source 是 reactive，設置 deep = true
   ↓
3. getter = () => traverse(state)
   ↓
4. 執行 effect.run()
   ↓
   activeEffect = watchEffect
   ↓
5. 執行 getter() → traverse(state)
   ↓
6. traverse 訪問 state.user
   ↓
   觸發 Proxy get: state['user']
   ↓
   track(state原始對象, 'user')
   ↓
   targetMap.get(state原始對象).get('user').add(watchEffect)
   ↓
   返回 state.user (這也是一個 Proxy)
   ↓
7. traverse 繼續訪問 state.user.profile
   ↓
   觸發 Proxy get: state.user['profile']
   ↓
   track(state.user原始對象, 'profile')
   ↓
   targetMap.get(state.user原始對象).get('profile').add(watchEffect)
   ↓
   返回 state.user.profile (這也是一個 Proxy)
   ↓
8. traverse 繼續訪問 state.user.profile.name
   ↓
   觸發 Proxy get: state.user.profile['name']
   ↓
   track(state.user.profile原始對象, 'name')
   ↓
   targetMap.get(state.user.profile原始對象).get('name').add(watchEffect)
   ↓
9. traverse 繼續訪問 state.user.profile.age
   ↓
   觸發類似的收集過程
   ↓
10. 依賴收集完成
```

**結果：targetMap 的結構**

```javascript
targetMap = WeakMap {
  state原始對象 → Map {
    'user' → Set([watchEffect])
  },
  state.user原始對象 → Map {
    'profile' → Set([watchEffect])
  },
  state.user.profile原始對象 → Map {
    'name' → Set([watchEffect]),
    'age' → Set([watchEffect])
  }
}
```

### 5.3 深度監聽的觸發過程

**修改深層屬性：`state.user.profile.name = 'Jane'`**

```
1. state.user.profile.name = 'Jane'
   ↓
2. 觸發 Proxy set: state.user.profile['name']
   ↓
3. trigger(state.user.profile原始對象, 'SET', 'name')
   ↓
4. 從 targetMap 查找：
   targetMap.get(state.user.profile原始對象).get('name')
   → Set([watchEffect])
   ↓
5. 執行 watchEffect.scheduler()
   ↓
6. 將 watchEffect 加入更新隊列
   ↓
7. nextTick 時執行回調
   ↓
8. callback(newVal, oldVal) 被調用
```

**這就是為什麼修改深層屬性也能觸發 watch！**

---

## 6. 更新調度機制

### 6.1 調度器系統

Vue 使用隊列系統來批量處理更新，避免同一個 tick 內的多次數據變化導致多次渲染。

```typescript
// 更新隊列
const queue: (() => void)[] = []
const activePreFlushCbs: (() => void)[] = []
const activePostFlushCbs: (() => void)[] = []

let isFlushing = false // 是否正在刷新隊列
let isFlushPending = false // 是否已經安排了刷新

// 將 job 加入隊列
function queueJob(job: () => void) {
  // 去重：避免重複加入
  if (!queue.includes(job)) {
    queue.push(job)
  }
  queueFlush()
}

// 安排刷新隊列
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    // 使用 Promise.resolve() 實現 nextTick
    Promise.resolve().then(flushJobs)
  }
}

// 刷新隊列
function flushJobs() {
  isFlushPending = false
  isFlushing = true

  // 1. 執行 pre 隊列（組件更新前，watch 默認在這裡）
  flushPreFlushCbs()

  // 2. 執行主隊列（組件渲染）
  try {
    for (let i = 0; i < queue.length; i++) {
      const job = queue[i]
      job()
    }
  } finally {
    queue.length = 0
  }

  // 3. 執行 post 隊列（組件更新後）
  flushPostFlushCbs()

  isFlushing = false

  // 如果在執行過程中又有新的 job 加入，繼續刷新
  if (queue.length || activePreFlushCbs.length || activePostFlushCbs.length) {
    flushJobs()
  }
}
```

### 6.2 watch 的三種 flush 模式

```typescript
// 1. flush: 'pre' (默認) - 組件更新前執行
watch(source, callback, { flush: 'pre' })
// 用於：需要在 DOM 更新前執行的邏輯

// 2. flush: 'post' - 組件更新後執行
watch(source, callback, { flush: 'post' })
// 用於：需要訪問更新後的 DOM

// 3. flush: 'sync' - 同步執行（不推薦）
watch(source, callback, { flush: 'sync' })
// 用於：需要立即響應的場景，但會影響性能
```

### 6.3 批量更新示例

```typescript
const count = ref(0)

watch(count, (newVal) => {
  console.log('watch triggered:', newVal)
})

// 同一個 tick 內多次修改
count.value++ // 1
count.value++ // 2
count.value++ // 3

// 輸出：watch triggered: 3
// 只觸發一次！因為更新被批量處理了
```

---

## 7. 完整流程圖

### 7.1 響應式對象創建流程

```
┌─────────────────────────────────────────────────────────┐
│                    用戶代碼                              │
└─────────────────────────────────────────────────────────┘
                          │
                          ├──────────────┬──────────────┐
                          ▼              ▼              ▼
                    const count     const state    const user
                    = ref(0)        = reactive({   = ref({
                                      count: 0      name: 'John'
                                    })              })
                          │              │              │
                          ▼              ▼              ▼
┌─────────────────────────────────────────────────────────┐
│                  響應式 API 層                           │
├─────────────────────────────────────────────────────────┤
│  ref()          reactive()        shallowRef()          │
│    │                │                   │                │
│    └─→ RefImpl      └─→ Proxy          └─→ RefImpl     │
│         │                │                   │           │
│         │                │                   │           │
│    .value 是      直接是 Proxy        .value 是          │
│   toReactive(0)                        原始值            │
│        │                                                 │
│        └─→ 如果是對象，調用 reactive()                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Proxy 創建層                            │
├─────────────────────────────────────────────────────────┤
│  createReactiveObject()                                 │
│    │                                                     │
│    ├─→ 檢查緩存 (reactiveMap)                           │
│    │   ├─ 有緩存：直接返回                               │
│    │   └─ 無緩存：創建新 Proxy                           │
│    │                                                     │
│    └─→ new Proxy(target, handlers)                      │
│         │                                                │
│         └─→ handlers:                                    │
│              ├─ get: track() + 惰性代理嵌套對象          │
│              ├─ set: trigger()                           │
│              ├─ deleteProperty: trigger()                │
│              └─ has, ownKeys...                          │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Watch 創建和依賴收集流程

```
┌───────────────────────────────────────────────────────────────┐
│                         用戶代碼                               │
└───────────────────────────────────────────────────────────────┘
                               │
                               ▼
              watch(state, (newVal, oldVal) => {
                console.log('changed')
              }, { deep: true })
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                      Watch API 層                              │
├───────────────────────────────────────────────────────────────┤
│  doWatch(source, cb, options)                                 │
│    │                                                           │
│    ├─ 1. 規範化 source 為 getter                              │
│    │    ├─ isRef → getter = () => source.value               │
│    │    ├─ isReactive → getter = () => source, deep = true   │
│    │    └─ isFunction → getter = () => source()              │
│    │                                                           │
│    ├─ 2. 如果 deep = true，包裝 getter                        │
│    │    getter = () => traverse(baseGetter())                │
│    │                                                           │
│    ├─ 3. 創建 scheduler                                       │
│    │    根據 flush 決定調度策略                               │
│    │                                                           │
│    ├─ 4. 創建 ReactiveEffect                                  │
│    │    effect = new ReactiveEffect(getter, scheduler)       │
│    │                                                           │
│    └─ 5. 執行 effect.run() ← 關鍵：收集依賴                  │
│              │                                                 │
│              ▼                                                 │
└───────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                   ReactiveEffect.run()                         │
├───────────────────────────────────────────────────────────────┤
│  activeEffect = this ← 設置全局標記                           │
│    │                                                           │
│    ├─→ cleanupEffect(this) // 清理舊依賴                      │
│    │                                                           │
│    └─→ return this.fn() // 執行 getter                        │
│           │                                                    │
│           └─→ traverse(state) // 如果是深度監聽               │
│                 │                                              │
│                 ├─→ 訪問 state.user                           │
│                 │     │                                        │
│                 │     └─→ 觸發 Proxy get                      │
│                 │           │                                  │
│                 │           └─→ track(target, 'user')         │
│                 │                                              │
│                 ├─→ 訪問 state.user.profile                   │
│                 │     │                                        │
│                 │     └─→ 觸發 Proxy get                      │
│                 │           │                                  │
│                 │           └─→ track(target, 'profile')      │
│                 │                                              │
│                 └─→ 訪問 state.user.profile.name              │
│                       │                                        │
│                       └─→ 觸發 Proxy get                      │
│                             │                                  │
│                             └─→ track(target, 'name')         │
│                                                                │
│  activeEffect = undefined ← 清除全局標記                      │
└───────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                     track(target, key)                         │
├───────────────────────────────────────────────────────────────┤
│  if (!activeEffect) return // 不在響應式上下文中              │
│                                                                │
│  // 1. 獲取或創建 depsMap                                     │
│  let depsMap = targetMap.get(target)                          │
│  if (!depsMap) {                                              │
│    targetMap.set(target, depsMap = new Map())                │
│  }                                                             │
│                                                                │
│  // 2. 獲取或創建 dep                                         │
│  let dep = depsMap.get(key)                                   │
│  if (!dep) {                                                  │
│    depsMap.set(key, dep = new Set())                         │
│  }                                                             │
│                                                                │
│  // 3. 建立雙向連接                                           │
│  dep.add(activeEffect) // dep 記錄 effect                    │
│  activeEffect.deps.push(dep) // effect 記錄 dep              │
└───────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                    依賴收集完成                                │
├───────────────────────────────────────────────────────────────┤
│  targetMap 結構：                                              │
│                                                                │
│  WeakMap {                                                     │
│    state原始對象 → Map {                                       │
│      'user' → Set([watchEffect])                              │
│    },                                                          │
│    state.user原始對象 → Map {                                  │
│      'profile' → Set([watchEffect])                           │
│    },                                                          │
│    state.user.profile原始對象 → Map {                          │
│      'name' → Set([watchEffect]),                             │
│      'age' → Set([watchEffect])                               │
│    }                                                           │
│  }                                                             │
│                                                                │
│  ✅ 現在修改任何深層屬性都能找到 watchEffect                   │
└───────────────────────────────────────────────────────────────┘
```

### 7.3 數據變化和更新派發流程

```
┌───────────────────────────────────────────────────────────────┐
│                         用戶代碼                               │
└───────────────────────────────────────────────────────────────┘
                               │
                               ▼
                state.user.profile.name = 'Jane'
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                     Proxy set 攔截                             │
├───────────────────────────────────────────────────────────────┤
│  set(target, key, value, receiver) {                          │
│    const oldValue = target[key]                               │
│    const result = Reflect.set(target, key, value, receiver)   │
│                                                                │
│    if (hasChanged(value, oldValue)) {                         │
│      trigger(target, 'SET', key, value, oldValue)            │
│    }                                                           │
│                                                                │
│    return result                                              │
│  }                                                             │
└───────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│               trigger(target, 'SET', 'name')                   │
├───────────────────────────────────────────────────────────────┤
│  // 1. 查找依賴                                               │
│  const depsMap = targetMap.get(target)                        │
│  if (!depsMap) return                                         │
│                                                                │
│  const dep = depsMap.get(key) // dep = Set([watchEffect])    │
│                                                                │
│  // 2. 收集需要執行的 effects                                 │
│  const effects = new Set()                                    │
│  dep.forEach(effect => {                                      │
│    if (effect !== activeEffect) { // 避免無限循環             │
│      effects.add(effect)                                      │
│    }                                                           │
│  })                                                            │
│                                                                │
│  // 3. 執行 effects                                           │
│  effects.forEach(effect => {                                  │
│    if (effect.scheduler) {                                    │
│      effect.scheduler(effect) ← 使用 scheduler 調度           │
│    } else {                                                    │
│      effect() // 直接執行                                     │
│    }                                                           │
│  })                                                            │
└───────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                   effect.scheduler(effect)                     │
├───────────────────────────────────────────────────────────────┤
│  // Watch 的 scheduler 根據 flush 選項決定                    │
│                                                                │
│  if (flush === 'sync') {                                      │
│    job() // 同步執行                                          │
│  } else if (flush === 'pre') {                                │
│    queuePreFlushCb(job) // 加入 pre 隊列                      │
│  } else if (flush === 'post') {                               │
│    queuePostFlushCb(job) // 加入 post 隊列                    │
│  }                                                             │
└───────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                      queueJob(job)                             │
├───────────────────────────────────────────────────────────────┤
│  // 1. 去重檢查                                               │
│  if (!queue.includes(job)) {                                  │
│    queue.push(job)                                            │
│  }                                                             │
│                                                                │
│  // 2. 安排刷新                                               │
│  queueFlush()                                                 │
│    │                                                           │
│    └─→ if (!isFlushPending) {                                │
│          isFlushPending = true                                │
│          Promise.resolve().then(flushJobs) ← nextTick        │
│        }                                                       │
└───────────────────────────────────────────────────────────────┘
                               │
                               ▼
                          等待 nextTick...
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                       flushJobs()                              │
├───────────────────────────────────────────────────────────────┤
│  isFlushing = true                                            │
│                                                                │
│  // 1. Pre flush (watch 默認在這裡)                           │
│  flushPreFlushCbs()                                           │
│    └─→ 執行 watch callback(newValue, oldValue)               │
│                                                                │
│  // 2. Main flush (組件渲染)                                  │
│  queue.forEach(job => job())                                  │
│    └─→ 更新 DOM                                               │
│                                                                │
│  // 3. Post flush                                             │
│  flushPostFlushCbs()                                          │
│    └─→ 執行 flush: 'post' 的 watch                            │
│                                                                │
│  isFlushing = false                                           │
└───────────────────────────────────────────────────────────────┘
                               │
                               ▼
                          更新完成 ✅
```

### 7.4 完整的數據流示意圖

```
┌─────────────────────────────────────────────────────────────────┐
│                         初始化階段                               │
└─────────────────────────────────────────────────────────────────┘
           │
           │  const state = reactive({ user: { name: 'John' } })
           │  watch(state, callback, { deep: true })
           │
           ▼
   ┌───────────────┐
   │ 創建 Proxy    │ state 被包裝為 Proxy
   └───────────────┘
           │
           ▼
   ┌───────────────┐
   │ 創建 Effect   │ effect = new ReactiveEffect(getter, scheduler)
   └───────────────┘
           │
           ▼
   ┌───────────────┐
   │ 執行 getter   │ traverse(state) 遍歷所有屬性
   └───────────────┘
           │
           ├─→ 訪問 state.user
           │     └─→ track(state, 'user') → targetMap 記錄
           │
           ├─→ 訪問 state.user.name
           │     └─→ track(state.user, 'name') → targetMap 記錄
           │
           └─→ 依賴收集完成

┌─────────────────────────────────────────────────────────────────┐
│                         數據變化階段                             │
└─────────────────────────────────────────────────────────────────┘
           │
           │  state.user.name = 'Jane'
           │
           ▼
   ┌───────────────┐
   │ Proxy set     │ 攔截 set 操作
   └───────────────┘
           │
           ▼
   ┌───────────────┐
   │ trigger()     │ 查找 targetMap[state.user]['name']
   └───────────────┘
           │
           ▼
   ┌───────────────┐
   │ scheduler()   │ 調度 effect 執行
   └───────────────┘
           │
           ▼
   ┌───────────────┐
   │ queueJob()    │ 加入更新隊列
   └───────────────┘
           │
           ▼
   ┌───────────────┐
   │ nextTick()    │ Promise.resolve().then(flushJobs)
   └───────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         更新執行階段                             │
└─────────────────────────────────────────────────────────────────┘
           │
           │  nextTick 回調執行
           │
           ▼
   ┌───────────────┐
   │ flushJobs()   │ 刷新更新隊列
   └───────────────┘
           │
           ├─→ flushPreFlushCbs()
           │     └─→ watch callback(newVal, oldVal)
           │
           ├─→ flush main queue
           │     └─→ 組件重新渲染
           │
           └─→ flushPostFlushCbs()
                 └─→ flush: 'post' 的 watch
```

---

## 8. 關鍵問題解答

### Q1: ref 本質是用 value 包裝後的 reactive 嗎？

**部分正確。**

- ref 本身是 `RefImpl` 類實例，使用 `getter/setter` 攔截 `.value`
- 如果 `.value` 是對象，會調用 `toReactive(value)` → 就是 `reactive(value)`
- 如果 `.value` 是基礎類型，直接存儲，不會包裝

```typescript
const count = ref(0) // .value = 0，不是 Proxy
const user = ref({ name: 'John' }) // .value = reactive({ name: 'John' })，是 Proxy
```

### Q2: watch 為什麼只能接受響應式對象？

**不完全對！** watch 可以接受：

1. **ref 對象**：`watch(refObject, callback)`
2. **reactive 對象**：`watch(reactiveObject, callback)`
3. **getter 函數**：`watch(() => state.count, callback)` ← 最靈活
4. **數組**：`watch([ref1, ref2], callback)`

watch **不能直接**接受普通值，因為普通值無法被追蹤。

### Q3: deep watch 如何記錄深層屬性的依賴？

**答案：在 watch 初始化時，通過 traverse 函數遍歷所有屬性。**

```typescript
// watch 創建時
effect.run()
  ↓
traverse(state) // 遍歷所有屬性
  ↓
// 訪問 state.user.profile.name
state.user // 觸發 track(state, 'user')
state.user.profile // 觸發 track(state.user, 'profile')
state.user.profile.name // 觸發 track(state.user.profile, 'name')
  ↓
// 最終 watchEffect 被記錄在多個層級
targetMap = {
  state: { 'user': [watchEffect] },
  state.user: { 'profile': [watchEffect] },
  state.user.profile: { 'name': [watchEffect] }
}
```

**所以修改 `state.user.profile.name` 時：**

1. 觸發 `state.user.profile` 的 Proxy set
2. trigger 查找 `targetMap[state.user.profile]['name']`
3. 找到 watchEffect 並執行

### Q4: 為什麼 shallowRef 只追蹤 .value，而 shallowReactive 追蹤第一層？

**因為它們的結構不同：**

- **ref**: `.value` 是真正的數據
  - `ref.value` 變化 → 觸發 ref 的 setter → track/trigger
  - `ref.value.nested` 變化 → 如果 value 是 reactive，觸發 reactive 的 track/trigger
  - **shallowRef**：`.value` 不會被包裝為 reactive，所以 `.value.nested` 不會觸發

- **reactive**: 對象本身就是 Proxy
  - `reactive.prop` 變化 → 觸發 Proxy set → track/trigger
  - `reactive.nested.prop` 變化 → nested 也是 Proxy → track/trigger
  - **shallowReactive**：nested 不會被包裝為 Proxy，所以 `.nested.prop` 不會觸發

### Q5: 多個 watch 監聽同一個對象會怎樣？

**每個 watch 都會獨立記錄依賴：**

```typescript
const state = reactive({ count: 0 })

watch(state, () => console.log('watch 1'))
watch(state, () => console.log('watch 2'))

state.count++
// 輸出：
// watch 1
// watch 2
```

**targetMap 結構：**

```javascript
targetMap = {
  state: {
    count: Set([watchEffect1, watchEffect2]),
  },
}
```

### Q6: Vue 怎麼「來得及」把嵌套對象變成 Proxy？

**答案：不是「來得及」，而是「按需創建」（惰性代理）！**

#### 關鍵時機

```typescript
const state = reactive({
  user: {
    name: 'John'
  }
})

// 此時的內存結構：
state = Proxy {
  target: {
    user: { name: 'John' }  // ← 普通對象，還不是 Proxy！
  },
  handlers: { get, set, ... }
}
```

#### 訪問時才創建

```
1. 你寫：state.user
   ↓
2. 觸發 state 的 Proxy get 攔截器
   ↓
3. get(target, 'user', receiver) {
     const res = Reflect.get(target, 'user', receiver)
     // res = { name: 'John' } ← 從原始 target 取出的普通對象

     track(target, 'user') // 依賴收集

     // 關鍵：在返回前才包裝！
     if (isObject(res)) {
       return reactive(res)  // ← 現在才創建 Proxy！
     }
     return res
   }
   ↓
4. 返回的是新創建的 Proxy({ name: 'John' })
```

#### 完整時間線

```
時間點 0: 創建 reactive
┌─────────────────────────────────────┐
│ const state = reactive({            │
│   user: { name: 'John' }            │
│ })                                  │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 內存中只有一個 Proxy：              │
│                                     │
│ state (Proxy)                       │
│   ↓                                 │
│ target = {                          │
│   user: { name: 'John' } // 普通對象│
│ }                                   │
└─────────────────────────────────────┘

時間點 1: 訪問 state.user
┌─────────────────────────────────────┐
│ console.log(state.user)             │
└─────────────────────────────────────┘
         │
         ▼ 觸發 Proxy get
         │
         ▼
┌─────────────────────────────────────┐
│ get 函數執行：                      │
│ 1. const res = target['user']      │
│    // res = { name: 'John' }       │
│                                     │
│ 2. track(target, 'user')           │
│                                     │
│ 3. 檢查 res 是否為對象              │
│    if (isObject(res)) {            │
│      return reactive(res)          │
│    }                                │
│    ↓                                │
│    此時才創建第二個 Proxy！         │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 現在內存中有兩個 Proxy：            │
│                                     │
│ state (Proxy)                       │
│   ↓                                 │
│ target = {                          │
│   user: (Proxy) ← 新創建的！        │
│     ↓                               │
│   target = { name: 'John' }         │
│ }                                   │
└─────────────────────────────────────┘
```

#### 緩存機制

```typescript
const state = reactive({
  user: { name: 'John' },
})

// 第一次訪問
const user1 = state.user
// ✅ 創建 user 的 Proxy，並緩存到 reactiveMap

// 第二次訪問
const user2 = state.user
// ✅ 從 reactiveMap 取出之前創建的 Proxy，不會重複創建

console.log(user1 === user2) // true ← 同一個 Proxy 實例！
```

**緩存查找流程：**

```
state.user (第二次訪問)
  ↓
Proxy get 觸發
  ↓
const res = target['user'] // res = { name: 'John' } (原始對象)
  ↓
reactive(res) 被調用
  ↓
檢查 reactiveMap.get(res)
  ↓
有緩存！直接返回之前創建的 Proxy ✅
```

#### Vue 2 vs Vue 3 對比

**Vue 2 的問題（Object.defineProperty）：**

```typescript
// Vue 2 必須預先遍歷
function observe(obj) {
  if (!isObject(obj)) return

  // 遍歷所有屬性
  Object.keys(obj).forEach((key) => {
    const value = obj[key]

    // 遞歸處理嵌套對象
    observe(value) // ← 初始化時就要處理所有層級

    Object.defineProperty(obj, key, {
      get() {
        /* ... */
      },
      set() {
        /* ... */
      },
    })
  })
}

const bigData = {
  level1: {
    level2: {
      level3: {
        // ... 10 層嵌套
      },
    },
  },
}

observe(bigData) // ❌ 初始化時遍歷所有 10 層！
```

**Vue 3 的優勢（Proxy）：**

```typescript
// Vue 3 惰性處理
const bigData = reactive({
  level1: {
    level2: {
      level3: {
        // ... 10 層嵌套
      },
    },
  },
})
// ✅ 只創建最外層 Proxy，耗時極短

// 只有訪問時才創建內層 Proxy
bigData.level1 // ✅ 此時才創建 level1 的 Proxy
bigData.level1.level2 // ✅ 此時才創建 level2 的 Proxy
// 如果你不訪問 level3，它永遠不會被代理！
```

#### 性能對比

```typescript
// 測試數據：10 層嵌套，每層 10 個屬性
const deepObject = createDeepObject(10, 10)

// Vue 2
console.time('Vue 2 observe')
observeVue2(deepObject) // 遍歷所有節點
console.timeEnd('Vue 2 observe')
// Vue 2 observe: 150ms ❌

// Vue 3
console.time('Vue 3 reactive')
const proxy = reactive(deepObject) // 只創建最外層
console.timeEnd('Vue 3 reactive')
// Vue 3 reactive: 0.1ms ✅

// 訪問時才有開銷
console.time('access level3')
proxy.level1.level2.level3 // 創建 3 個 Proxy
console.timeEnd('access level3')
// access level3: 0.5ms ✅
```

**總結：**

- **初始化時**：只創建最外層 Proxy
- **訪問時**：在 get 攔截器中即時創建嵌套 Proxy
- **緩存機制**：避免重複創建同一個對象的 Proxy
- **性能優勢**：按需創建，大幅減少初始化時間

這就是為什麼 Vue 3 的響應式系統比 Vue 2 快得多的核心原因之一！

### Q7: Computed 和 Watch 的依賴收集有什麼區別？

**答案：核心機制相同，但執行策略完全不同！**

#### 相同點

兩者都使用 `ReactiveEffect` + `activeEffect` + `targetMap` 進行依賴收集：

```typescript
// 都是基於 ReactiveEffect
const watchEffect = new ReactiveEffect(getter, watchScheduler)
const computedEffect = new ReactiveEffect(getter, computedScheduler)
```

#### 關鍵差異對比表

| 特性          | Watch                            | Computed                            |
| ------------- | -------------------------------- | ----------------------------------- |
| **目的**      | 執行副作用（side effects）       | 計算衍生值（derived state）         |
| **執行時機**  | immediate 或依賴變化時           | 訪問 `.value` 時（懶執行）          |
| **緩存**      | ❌ 無緩存                        | ✅ 有緩存（dirty flag）             |
| **返回值**    | 無返回值（執行回調）             | 有返回值（computed value）          |
| **初始化**    | 立即執行 `effect.run()` 收集依賴 | ❌ 不執行，等待被訪問               |
| **scheduler** | 加入更新隊列 → nextTick 執行     | 標記 dirty + 觸發依賴               |
| **依賴收集**  | 收集 source 的依賴               | 收集 getter 的依賴 + 自身也可被追蹤 |

#### Computed 的源碼實現

```typescript
class ComputedRefImpl<T> {
  private _value!: T
  private _dirty = true // 關鍵：髒檢查標記
  public readonly effect: ReactiveEffect<T>
  public readonly __v_isRef = true

  constructor(getter: () => T) {
    // 關鍵：computed 也是用 ReactiveEffect！
    this.effect = new ReactiveEffect(getter, () => {
      // scheduler：當依賴變化時，只標記為 dirty，不立即重新計算
      if (!this._dirty) {
        this._dirty = true
        triggerRefValue(this) // 通知使用 computed 的地方更新
      }
    })
  }

  get value() {
    // 依賴收集：computed 本身也可以被追蹤
    trackRefValue(this)

    // 懶執行：只有在 dirty 時才重新計算
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run() // 執行 getter，收集依賴
    }

    return this._value
  }
}
```

#### 流程對比

**Watch 的流程：**

```
創建 watch
  ↓
創建 ReactiveEffect(getter, scheduler)
  ↓
✅ 立即執行 effect.run() 收集依賴
  ↓
依賴變化
  ↓
執行 scheduler → queueJob → nextTick
  ↓
執行 callback(newVal, oldVal)
```

**Computed 的流程：**

```
創建 computed
  ↓
創建 ReactiveEffect(getter, scheduler)
  ↓
❌ 不立即執行！等待被訪問
  ↓
第一次訪問 computed.value
  ↓
_dirty = true → 執行 effect.run()
  ↓
收集 getter 內的依賴 + 返回計算值
  ↓
_dirty = false，緩存結果
  ↓
依賴變化
  ↓
執行 scheduler → _dirty = true
  ↓
❌ 不重新計算！等下次訪問
  ↓
再次訪問 computed.value
  ↓
_dirty = true → 重新計算
```

#### 實際示例對比

```typescript
const count = ref(0)

// ==================== Watch ====================
watch(
  () => count.value * 2,
  (newVal) => {
    console.log('watch triggered:', newVal)
  },
)
// ✅ 立即執行 getter 收集依賴（但不執行回調）

count.value++ // 1
// → 立即觸發 scheduler
// → 加入更新隊列
// → nextTick 執行回調
// 輸出: watch triggered: 2

// ==================== Computed ====================
const doubled = computed(() => count.value * 2)
// ❌ 不執行 getter，不收集依賴

console.log('還沒訪問 computed')

console.log(doubled.value) // 第一次訪問
// ✅ 此時才執行 getter，收集依賴
// 輸出: 2

console.log(doubled.value) // 第二次訪問
// ✅ 使用緩存，不重新計算
// 輸出: 2

count.value++ // 1
// → 觸發 scheduler
// → _dirty = true
// ❌ 不重新計算

console.log(doubled.value) // 訪問才計算
// ✅ _dirty = true，重新計算
// 輸出: 4
```

#### 雙層依賴追蹤

Computed 的特別之處：**它既收集依賴，也被收集依賴**

```typescript
const count = ref(0)
const doubled = computed(() => count.value * 2)

// 在 watch 中使用 computed
watch(doubled, (newVal) => {
  console.log('doubled changed:', newVal)
})
```

**依賴關係：**

```javascript
targetMap = {
  count原始RefImpl: {
    value: Set([
      doubled的effect, // ← doubled 依賴 count
    ]),
  },
}

doubled的dep: Set([
  watchEffect, // ← watch 依賴 doubled
])
```

**觸發鏈：**

```
count.value++
  ↓
trigger(count, 'value')
  ↓
執行 doubled.effect.scheduler()
  ↓
_dirty = true
  ↓
triggerRefValue(doubled) ← 觸發 doubled 的依賴
  ↓
執行 watchEffect.scheduler()
  ↓
nextTick 執行 watch callback
```

#### 性能差異示例

```typescript
const count = ref(0)

// Computed: 懶執行 + 緩存
const doubled = computed(() => {
  console.log('computed getter 執行')
  return count.value * 2
})

// 不訪問，不執行
// ...

// 訪問 10 次
for (let i = 0; i < 10; i++) {
  console.log(doubled.value)
}
// 輸出: computed getter 執行 (只執行一次！)
//      2, 2, 2, 2, 2, 2, 2, 2, 2, 2

// VS Watch: 每次依賴變化都執行
watch(
  () => count.value * 2,
  (newVal) => {
    console.log('watch callback:', newVal)
  },
)

count.value = 1 // 輸出: watch callback: 2
count.value = 2 // 輸出: watch callback: 4
count.value = 3 // 輸出: watch callback: 6
// 每次都執行！
```

#### 使用場景總結

**使用 Computed：**

- ✅ 需要根據響應式數據計算衍生值
- ✅ 計算結果會被多次使用（利用緩存）
- ✅ 純計算邏輯，無副作用
- ✅ 例如：`fullName = firstName + lastName`

**使用 Watch：**

- ✅ 需要執行副作用（API 調用、日誌、DOM 操作）
- ✅ 需要訪問舊值和新值
- ✅ 需要異步操作或複雜邏輯
- ✅ 例如：根據搜索詞調用 API

**核心差異總結：**

- Computed 是**響應式的 getter**（計算屬性）
- Watch 是**響應式的副作用**（觀察者）
- 兩者都基於同一套 `ReactiveEffect` 機制
- 但 Computed 有**懶執行 + 緩存**，Watch 有**立即執行 + 無緩存**

---

## 9. 性能優化建議

### 9.1 選擇合適的響應式 API

```typescript
// ❌ 不需要深層響應時避免使用 reactive
const state = reactive({
  bigData: {
    /* 大量嵌套數據 */
  },
})

// ✅ 使用 shallowReactive
const state = shallowReactive({
  bigData: {
    /* 只需要追蹤 bigData 的替換 */
  },
})

// ✅ 或使用 shallowRef
const bigData = shallowRef({
  /* 大量嵌套數據 */
})
```

### 9.2 避免不必要的深度監聽

```typescript
// ❌ 監聽整個大對象
watch(state, callback, { deep: true })

// ✅ 只監聽需要的屬性
watch(() => state.user.name, callback)
```

### 9.3 使用 markRaw 跳過響應式包裝

```typescript
import { reactive, markRaw } from 'vue'

const state = reactive({
  // 不需要響應式的大型對象（如第三方庫實例）
  chart: markRaw(new Chart()),
})
```

---

## 10. 總結

Vue 3 響應式系統的核心流程：

1. **初始化**：reactive/ref 創建 Proxy 包裝對象
2. **依賴收集**：通過 activeEffect + targetMap 記錄依賴關係
3. **深度監聽**：traverse 函數遍歷所有屬性建立多層依賴
4. **觸發更新**：Proxy set 觸發 trigger 查找並執行 effects
5. **批量調度**：scheduler + 隊列系統實現異步批量更新

**關鍵數據結構：**

- `targetMap`: WeakMap<target, Map<key, Set<effect>>>
- `activeEffect`: 當前正在收集依賴的 effect
- `queue`: 更新隊列，用於批量處理

**設計亮點：**

- 惰性代理：嵌套對象只在訪問時才被代理
- 雙向記錄：effect ↔ dep 互相記錄，便於清理
- 批量更新：避免同一 tick 內重複渲染
- 靈活調度：三種 flush 模式適應不同場景

這就是 Vue 3 響應式系統的完整實現原理！🎉
