# Auth Feature

## 📂 Structure

```
features/auth/
├── api/                    # RTK Query API endpoints
│   └── authApi.ts
├── components/             # Feature-specific UI components
│   ├── SignInForm/
│   ├── ContextSelectionForm/
│   └── index.ts           # Barrel export
├── hooks/                  # Custom hooks
│   └── useAuth.ts
├── services/               # Business logic & actions
│   ├── auth.actions.ts
│   └── auth.service.ts
├── store/                  # Redux state management
│   ├── authSlice.ts       # Slice definition
│   ├── selectors.ts       # Memoized selectors
│   └── index.ts           # Barrel export
├── types/                  # TypeScript interfaces
│   └── index.ts
└── index.ts               # Feature barrel export
```

## 🎯 Purpose

Manages user authentication flow including:
- Credential validation
- Context selection (Client, Role, Org, Warehouse)
- Token management
- Session handling

## 🔌 Usage

### Import from Feature

```typescript
import { 
  SignInForm, 
  useAuth, 
  selectAuthToken 
} from '@/features/auth';
```

### Use Hook

```typescript
const { 
  credentials, 
  updateCredentials, 
  isLoading 
} = useAuth();
```

## 🏗️ Architecture Principles

1. **Feature Colocation**: All auth-related code in one place
2. **Barrel Exports**: Clean imports via index.ts
3. **Separation of Concerns**: 
   - Components = UI
   - Services = Business Logic
   - Store = State Management
   - API = Data Fetching

## 📝 Notes

- Components are **NOT** moved to shared (auth-specific)
- Selectors separated from slice for better organization
- Uses RTK Query for API calls
