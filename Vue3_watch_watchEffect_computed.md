# Vue3 響應式系統：watch vs watchEffect vs computed

## 目錄

- [一、依賴收集方式](#一依賴收集方式)
- [二、執行時機](#二執行時機)
- [三、依賴變化時的反應](#三依賴變化時的反應)
- [四、內部機制對比](#四內部機制對比)
- [五、典型使用場景](#五典型使用場景)
- [六、「搭便車」機制](#六搭便車機制重要理解)
- [七、快取機制對比](#七快取機制對比)
- [八、總結表格](#八總結表格)
- [九、記憶口訣](#九記憶口訣)

---

## 一、依賴收集方式

|                   | 如何知道依賴誰             | 收集時機                    |
| ----------------- | -------------------------- | --------------------------- |
| **`watch`**       | 手動明確指定               | 初始化時（不執行 callback） |
| **`watchEffect`** | 自動追蹤（執行時訪問到的） | 掛載時立即執行              |
| **`computed`**    | 自動追蹤（執行時訪問到的） | 第一次被訪問時執行          |

---

## 二、執行時機

### `watch`：被動等待變化

```typescript
watch(
  () => searchTerm.value, // 明確告訴 Vue：監視這個
  (newV, oldV) => {
    console.log('執行副作用')
  },
)
```

**時間線：**

```
1. 初始化 → 建立依賴關係（不執行 callback）
2. searchTerm 變化 → 立即執行 callback
3. searchTerm 再變化 → 立即執行 callback
```

---

### `watchEffect`：主動立即執行

```typescript
watchEffect(() => {
  console.log('執行副作用:', searchTerm.value)
})
```

**時間線：**

```
1. 初始化 → 立即執行（收集依賴 + 執行副作用）
2. searchTerm 變化 → 立即執行
3. searchTerm 再變化 → 立即執行
```

---

### `computed`：惰性被動計算

```typescript
const doubled = computed(() => {
  console.log('計算中')
  return count.value * 2
})
```

**時間線：**

```
1. 初始化 → 不執行（創建 computed 實例）
2. 第一次訪問 doubled.value → 執行計算，收集依賴，快取結果
3. count 變化 → 只標記 dirty（不計算）
4. 訪問 doubled.value → 檢查 dirty，重新計算，更新快取
5. 再次訪問 doubled.value → dirty 是 false，直接返回快取
```

---

## 三、依賴變化時的反應

```typescript
const count = ref(0)

// watch
watch(
  () => count.value,
  () => {
    console.log('watch 執行')
  },
)

// watchEffect
watchEffect(() => {
  console.log('watchEffect 執行:', count.value)
})

// computed
const doubled = computed(() => {
  console.log('computed 計算')
  return count.value * 2
})
```

**修改 `count.value = 10` 時：**

|                   | 立即反應    | 實際行為                     |
| ----------------- | ----------- | ---------------------------- |
| **`watch`**       | ✅ 立即執行 | 輸出：`watch 執行`           |
| **`watchEffect`** | ✅ 立即執行 | 輸出：`watchEffect 執行: 10` |
| **`computed`**    | ❌ 不執行   | 只標記 `_dirty = true`       |

**訪問 `doubled.value` 時：**

- ✅ 檢查 `_dirty === true`
- ✅ 執行計算，輸出：`computed 計算`
- ✅ 返回結果 `20`

---

## 四、內部機制對比

### 依賴記錄（都一樣）

所有三者都會被記錄到依賴源的 effect 清單中：

```typescript
const count = ref(0)

// count 內部的依賴清單：
{
  value: 0,
  dep: Set([
    watchEffect,   // effect 1
    watchCallback, // effect 2
    computedEffect // effect 3
  ])
}
```

### 觸發機制（關鍵差異）

當 `count.value = 10` 時，通知所有 effect：

```typescript
// count 的 setter
set value(newVal) {
  this._value = newVal
  // 通知所有依賴的 effect
  triggerEffects(this.dep)
}

function triggerEffects(effects) {
  effects.forEach(effect => {
    if (effect.scheduler) {
      effect.scheduler()  // ← 關鍵！執行 scheduler
    } else {
      effect.run()
    }
  })
}
```

### Scheduler 的不同行為

```typescript
// watch 的 scheduler
{
  scheduler: () => {
    // 立即執行 callback
    callback(newValue, oldValue)
  }
}

// watchEffect 的 scheduler
{
  scheduler: () => {
    // 立即執行 effect
    effect.run()
  }
}

// computed 的 scheduler
{
  scheduler: () => {
    // 只標記 dirty
    this._dirty = true
    // 通知依賴 computed 的人（如模板）
    triggerRefValue(this)
  }
}
```

---

## 五、典型使用場景

### `watch`：需要新舊值對比、異步操作

```typescript
watch(
  () => searchTerm.value,
  async (newVal, oldVal) => {
    if (newVal.length > oldVal.length) {
      // 需要對比新舊值
      const results = await fetchAPI(newVal) // 異步操作
      updateResults(results)
    }
  },
)
```

### `watchEffect`：簡單的同步副作用

```typescript
watchEffect(() => {
  // 自動追蹤所有依賴，立即執行副作用
  document.title = `${count.value} 次點擊`
  localStorage.setItem('count', count.value)
})
```

### `computed`：計算衍生數據

```typescript
const filteredList = computed(() => {
  // 給模板使用的計算值，自動快取
  return list.value.filter((item) => item.name.includes(searchTerm.value))
})
```

---

## 六、「搭便車」機制（重要理解）

### `computed` 的被動特性

```typescript
const count = ref(0)
const doubled = computed(() => count.value * 2)
```

```vue
<template>
  <div>{{ doubled }}</div>
</template>
```

**完整流程：**

```
1. count.value = 10（setter 觸發）
   ↓
2. count 通知 doubled（執行 scheduler）
   ↓
3. doubled._dirty = true（標記髒）
   ↓
4. doubled 通知模板：「我變髒了，你可能要重新渲染」
   ↓
5. 模板進入更新隊列（microtask）
   ↓
6. 模板重新渲染時訪問 doubled.value（getter）
   ↓
7. doubled 檢查：_dirty === true?
   ↓
8. 是！重新計算 → count.value * 2 = 20
   ↓
9. doubled._dirty = false，快取結果 20
   ↓
10. 返回 20 給模板
```

**關鍵：** `computed` 不會主動計算，而是**等模板刷新時順便被訪問，順便檢查 dirty，順便計算**。

---

## 七、快取機制對比

```typescript
const count = ref(0)

// computed：有快取
const doubled = computed(() => {
  console.log('計算')
  return count.value * 2
})

console.log(doubled.value) // 計算 → 10
console.log(doubled.value) // 直接返回快取 → 10
console.log(doubled.value) // 直接返回快取 → 10

// 函數：無快取
const getDoubled = () => {
  console.log('計算')
  return count.value * 2
}

console.log(getDoubled()) // 計算 → 10
console.log(getDoubled()) // 計算 → 10（每次都計算）
console.log(getDoubled()) // 計算 → 10（每次都計算）
```

---

## 八、總結表格

| 特性           | `watch`     | `watchEffect` | `computed`           |
| -------------- | ----------- | ------------- | -------------------- |
| **掛載時執行** | ❌          | ✅ 立即執行   | ❌                   |
| **依賴變化時** | ✅ 立即執行 | ✅ 立即執行   | ❌ 只標記 dirty      |
| **被訪問時**   | -           | -             | ✅ 檢查 dirty 並計算 |
| **返回值**     | ❌          | ❌            | ✅ 返回計算結果      |
| **快取**       | ❌          | ❌            | ✅                   |
| **獲取舊值**   | ✅          | ❌            | ❌                   |
| **依賴收集**   | 手動指定    | 自動追蹤      | 自動追蹤             |
| **執行特性**   | 被動響應    | 主動執行      | 惰性計算             |
| **典型用途**   | 異步副作用  | 同步副作用    | 數據轉換             |

---

## 九、記憶口訣

- **`watch`**：精確狙擊手（指定目標，變化時開槍）
- **`watchEffect`**：主動執行者（立即行動，隨時響應）
- **`computed`**：懶惰天才（等你問我，我才算給你）

---

_最後更新：2026-02-04_
