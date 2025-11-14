# Repository Pattern

This directory contains repositories that encapsulate all database access, following the Repository pattern similar to ActiveRecord in Rails.

## Architecture

```
lib/repositories/
├── ServiceRepository.ts      # Main repository (server-side code only)
├── ServiceRepository.server.ts # Server Actions for client components
└── index.ts                  # Centralized exports
```

## Structure

### 1. Main Repository (`*.ts`)
- Contains static methods that encapsulate Prisma queries
- Can only be used in server-side code (Server Components, Server Actions, API Routes)
- Does not contain business logic, only data access
- Similar to ActiveRecord models in Rails

**Example:**
```typescript
import { ServiceRepository } from '@/lib/repositories';

// In a Server Component or Server Action
const services = await ServiceRepository.findEnabled();
```

### 2. Server Actions Wrapper (`*.server.ts`)
- Re-exports repository methods as Server Actions
- Allows client components (`'use client'`) to access data
- Marked with `"use server"` so Next.js treats them as Server Actions

**Example:**
```typescript
import { getEnabledService } from '@/lib/repositories/ServiceRepository.server';

// In a Client Component
const services = await getEnabledService();
```

### 3. Server Actions in `/app/dashboard/*/actions.ts`
- Use repositories for data access
- Add logging, validation, and business logic
- Can be called from client or server components

**Example:**
```typescript
import { ServiceRepository } from '@/lib/repositories';
import pino from 'pino';

const logger = pino({ name: "serviceToJobTypes-actions" });

export async function getAllServices() {
  logger.info('Fetching all services...');
  return ServiceRepository.findAll();
}
```

## When to use each one

### Use the Repository directly when:
- ✅ You're in a **Server Component**
- ✅ You're in a **Server Action** (in `/app/dashboard/*/actions.ts`)
- ✅ You're in an **API Route**
- ✅ You need direct access without additional logic

### Use Server Actions Wrapper when:
- ✅ You're in a **Client Component** (`'use client'`)
- ✅ You need to call from the client without going through `/app/dashboard/*/actions.ts`

### Use Server Actions in `/app/dashboard/*/actions.ts` when:
- ✅ You need additional logging
- ✅ You need business validation
- ✅ You need to transform data before returning it
- ✅ You want to maintain compatibility with existing code

## Advantages of this architecture

1. **Separation of concerns**: Data access separated from business logic
2. **Reusability**: Repositories can be used from multiple places
3. **Testability**: Easy to mock for tests
4. **Maintainability**: Database changes are centralized in one place
5. **Clear semantics**: Components don't import from `/app/dashboard/*/actions.ts` when it doesn't make semantic sense

## Creating a new repository

1. Create `lib/repositories/YourEntityRepository.ts`:
```typescript
import { prisma } from "@/lib/prisma";

export class YourEntityRepository {
  static async findAll() {
    return prisma.yourEntity.findMany();
  }
  
  static async findById(id: string) {
    return prisma.yourEntity.findUnique({ where: { id } });
  }
  
  // ... other methods
}
```

2. Create `lib/repositories/YourEntityRepository.server.ts` if you need access from client components:
```typescript
"use server";

import { YourEntityRepository } from "./YourEntityRepository";

export async function getAllYourEntities() {
  return YourEntityRepository.findAll();
}
```

3. Export in `lib/repositories/index.ts`:
```typescript
export { YourEntityRepository } from './YourEntityRepository';
```

4. Update actions in `/app/dashboard/your-entity/actions.ts` to use the repository.

## References

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
