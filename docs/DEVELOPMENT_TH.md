# คู่มือการพัฒนา (Development Guide)

เอกสารนี้จะอธิบายวิธีการทำงานกับระบบ **Minions AI Builder** ในรูปแบบ Monorepo รวมถึงแนวคิดสถาปัตยกรรมและการทดสอบระบบ

## 🏗 สถาปัตยกรรม (Architecture Overview)

เราใช้โครงสร้างแบบ **Monorepo** ซึ่งจัดการโดย `npm workspaces` โดยแบ่งออกเป็น 3 ส่วนหลัก:

| Workspace           | Path              | หน้าที่                            | พอร์ต  |
| ------------------- | ----------------- | ---------------------------------- | ------ |
| **@minions/web**    | `apps/web`        | ส่วนหน้าบ้าน (Frontend) ใช้ Nuxt 3 | `3000` |
| **@minions/api**    | `apps/api`        | หัวใจหลักหลังบ้าน (Backend Engine) | `3001` |
| **@minions/shared** | `packages/shared` | ตัวแปรกลาง, โลจิก และระบบธีม       | -      |

> [!NOTE]
> ตั้งแต่เวอร์ชัน v1.2.0 เป็นต้นไป โลจิกสำคัญของโปรเจกต์ (Save, Load, Publish, Analytics) ได้ถูกรวมศูนย์ไว้ที่ **@minions/api** เพื่อความปลอดภัยและรวบรวม Business Logic ไว้ที่จุดเดียวครับ

---

## 🧠 Mindset: 3 เสาหลักของการพัฒนา

### 1. Clean Code & Clear Structure (โค้ดสะอาด โครงสร้างชัด)

เราไม่ได้แค่เขียนโค้ดให้ทำงานได้ แต่เราเขียนให้คนอื่น (และตัวเราในอนาคต) อ่านรู้เรื่อง

- **วางไฟล์ให้ถูกที่**: อย่ากองรวมกัน แยกตามหน้าที่ (Domain)
- **Single Source of Truth**: อย่าประกาศ Type ซ้ำซ้อน ให้ดึงมาจาก `packages/shared`

### 2. Domain-Driven Design (DDD)

เราออกแบบระบบตาม "ธุรกิจ" ไม่ใช่ตาม "เทคนิค"

- แทนที่จะแบ่งโฟลเดอร์เป็น `controllers`, `models` เราแบ่งเป็น:
  - `domain/generator`: โลจิกเกี่ยวกับ AI และการสร้างเนื้อหา
  - `domain/scaffolder`: โลจิกเกี่ยวกับการสร้างไฟล์และจัด Zip
- วิธีนี้ทำให้เวลาแก้ Business Logic ส่วนไหน ก็ไปที่โฟลเดอร์นั้นจบในที่เดียว

### 3. Separation of Concerns (แยกส่วนรับผิดชอบ)

- **Frontend** มีหน้าที่แค่ "แสดงผล" และ "คุยกับ API" (ไม่ควรมี Business Logic หนักๆ)
- **Backend** มีหน้าที่ "ประมวลผล" และ "จัดการข้อมูล" (ไม่ควรยุ่งกับ UI)
- การแยก Project แบบนี้ทำให้เราสามารถเลือกวิธี Deploy หรือสเกลแต่ละส่วนอิสระจากกันได้

---

## 🚀 วิธีการรันโปรเจกต์ (Running)

### วิธีที่ 1: รันพร้อมกัน (แนะนำสำหรับ dev ทั่วไป)

```bash
npm run dev
```

คำสั่งนี้จะเปิดทั้ง Web และ API ขึ้นมาพร้อมกัน

### วิธีที่ 2: รันแยกกัน (สำหรับ Debug หรือทดสอบเจาะจง)

ถ้าอยากดู Log แยกจอ หรืออยากรันแค่ส่วนเดียว ให้เปิด Terminal 2 จอ:

**จอที่ 1: รัน Backend (API)**

```bash
npm run dev:api
# หรือ
npm run dev --workspace=@minions/api
```

_จะรันที่ http://localhost:3001_

**จอที่ 2: รัน Frontend (Web)**

```bash
npm run dev:web
# หรือ
npm run dev --workspace=@minions/web
```

_จะรันที่ http://localhost:3000_

> **หมายเหตุ**: ตัว Frontend ถูกตั้งค่าให้ส่ง Request ที่ขึ้นต้นด้วย `/api` ไปยังพอร์ต 3001 โดยอัตโนมัติ (Proxy) ดังนั้นจึงทำงานร่วมกันได้ทันที

---

## 🧪 การทดสอบ (Testing)

เราใช้ **Vitest** ในการเทส โดยเน้นที่ Logic ของ Backend เป็นหลัก

### การรัน Test ทั้งหมด

```bash
npm run test
```

### การรัน Test เฉพาะ Backend

```bash
npm run test --workspace=@minions/api
```

---

## 🎨 ระบบดีไซน์กลาง (Global Design System)

Builder ของเราใช้ระบบดีไซน์ที่รวมศูนย์ไว้ที่ `packages/shared/src/theme/themes.ts`

### การเพิ่มธีมใหม่:

1.  กำหนดชุดสีและฟอนต์ใน `CURATED_THEMES` ภายในไฟล์ `packages/shared/src/theme/themes.ts`
2.  ตรวจสอบว่าธีมนั้นทำตาม Interface `ThemeDefinition`
3.  ตัวหน้าจอจัดการ (`SectionEditor.vue`) จะดึงธีมใหม่ไปแสดงเป็นตัวเลือกให้โดยอัตโนมัติครับ

### Composables ที่สำคัญ:

- **`useThemeVariables`**: อยู่ใน `apps/web/composables/` ทำหน้าที่แปลงค่าจาก Theme Config มาเป็น CSS Variables เพื่อฉีดเข้าไปในหน้าพรีวิว

## ⚡️ Vue 3 + Vite Integration

นอกจาก Nuxt แล้ว ระบบของเรายังรองรับการ Export โปรเจกต์เป็น **Vue 3 + Vite** (Pure SPA) ด้วย

### หลักการทำงาน

1.  **Universal Components**: คอมโพเนนต์ทั้งหมดถูกเขียนด้วย Vue 3 มาตรฐาน (`<script setup>`) โดยไม่พึ่งพา Auto-imports ของ Nuxt
2.  **Scaffolding Engine**: API จะสร้างไฟล์ Config ของ Vite (`vite.config.ts`, `main.ts`) ให้เองอัตโนมัติ
3.  **Router Compatibility**: ใช้ `<RouterLink>` ที่ทำงานได้ทั้งใน Nuxt และ Vite

### คู่มือเทียบเคียง (Migration Guide)

สำหรับผู้ที่คุ้นเคยกับ Nuxt นี่คือสิ่งที่เปลี่ยนไปเมื่อใช้ Vite:

#### 1. การดึงข้อมูล (Data Fetching)

- **Nuxt**: ใช้ `await $fetch(...)`
- **Vite**: เปลี่ยนไปใช้ `fetch` ของ Browser หรือลง library `ofetch`

```ts
// src/components/MyComponent.vue
const response = await fetch("/api/data").then((r) => r.json());
```

#### 2. การจัดการ State

- **Nuxt**: ใช้ `useState(...)`
- **Vite**: ใช้ `ref()` ปกติ หรือใช้ **Pinia** (ต้องลงเพิ่มเอง)

```ts
import { ref } from "vue";
const count = ref(0);
```

#### 3. Environment Variables

- **Nuxt**: `useRuntimeConfig().public.apiUrl`
- **Vite**: ใช้ `import.meta.env.VITE_...`

```ts
const apiUrl = import.meta.env.VITE_APP_API_URL;
```

### วิธีการตรวจสอบ (Verification)

1.  รัน Builder (`npm run dev`)
2.  กดปุ่ม **Download Kit** เลือก **Vue + Vite**
3.  แตกไฟล์ ZIP แล้วลองรัน `npm install && npm run dev`

---

## 🚢 การนำไปใช้งานจริง (Deployment)

แม้เราจะพัฒนาใน Repo เดียวกัน (Monorepo) แต่เวลา Deploy เราแยกกันเป็น 2 Services ได้จริง:

1. **Web App (`apps/web`)**: นำไป Deploy บน Vercel หรือ Host ที่รองรับ Nuxt

   - หน้าที่: เป็นหน้าเว็บให้ user ใช้งาน
   - การตั้งค่า: ชี้ Root Directory ไปที่ `apps/web`

2. **API Service (`apps/api`)**: นำไป Deploy บน Cloud Run, Vercel Functions หรือ VPS
   - หน้าที่: เป็นตัวประมวลผล AI
   - การตั้งค่า: ชี้ Root Directory ไปที่ `apps/api`

วิธีนี้ทำให้ถ้าวันหนึ่ง Frontend คนเข้าเยอะมาก เราก็สเกลแค่ Frontend ได้ หรือถ้า AI คำนวณหนัก เราก็เพิ่ม Server ให้แค่ Backend ได้ครับ
