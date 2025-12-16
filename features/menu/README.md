# Menu Feature

## 📂 Structure

```
features/menu/
├── api/                    # RTK Query API endpoints
│   └── menuApi.ts
├── hooks/                  # Custom hooks
│   └── useMenu.ts
├── services/               # Business logic
│   └── menu.service.ts    # Menu transformations & utilities
├── store/                  # Redux state management
│   ├── menuSlice.ts       # Slice definition
│   ├── selectors.ts       # Memoized selectors
│   └── index.ts           # Barrel export
├── types/                  # TypeScript interfaces
│   └── index.ts
└── index.ts               # Feature barrel export
```

## 🎯 Purpose

Manages application menu/navigation including:
- Menu tree loading
- Expand/collapse state
- Menu item navigation
- Menu transformations (iDempiere → App format)

## 🔌 Usage

### Import from Feature

```typescript
import { 
  useMenu, 
  selectMenuItems,
  transformMenuEntry 
} from '@/features/menu';
```

### Use Hook

```typescript
const { 
  menuItems, 
  toggleMenuItem, 
  isMenuExpanded 
} = useMenu();
```

## 🏗️ Services

### `menu.service.ts`

Utility functions for menu operations:
- `transformMenuEntry()` - Convert iDempiere menu to app format
- `findMenuItemById()` - Search menu tree
- `getMenuItemParents()` - Get parent chain
- `filterMenuItems()` - Search/filter menu

## 📝 Notes

- Menu types in `shared/types/menu.ts` (reusable across app)
- Feature types in `features/menu/types` (feature-specific)
- Services provide pure functions for menu manipulation
