# Component Library Documentation

## Overview

FitTrack uses a combination of custom components and shadcn/ui components, styled with Tailwind CSS. This documentation covers all reusable components in the system.

## UI Components

### Layout Components

#### MainLayout

```javascript
// components/layout/MainLayout.jsx
"use client";

export default function MainLayout({ children }) {
  // Implementation
}
```

**Props:**

- `children`: ReactNode (required)

**Features:**

- Responsive navigation
- User authentication status
- Role-based menu items
- Mobile-friendly design

#### DashboardLayout

```javascript
// components/layout/DashboardLayout.jsx
"use client";

export default function DashboardLayout({ children }) {
  // Implementation
}
```

**Props:**

- `children`: ReactNode (required)

**Features:**

- Sidebar navigation
- Quick stats overview
- User profile section
- Notification center

### Form Components

#### FormInput

```javascript
// components/ui/FormInput.jsx
"use client";

export default function FormInput({
  label,
  name,
  type = "text",
  error,
  ...props
}) {
  // Implementation
}
```

**Props:**

- `label`: string (required)
- `name`: string (required)
- `type`: string
- `error`: string
- Additional HTML input props

#### FormSelect

```javascript
// components/ui/FormSelect.jsx
"use client";

export default function FormSelect({ label, name, options, error, ...props }) {
  // Implementation
}
```

**Props:**

- `label`: string (required)
- `name`: string (required)
- `options`: Array<{ value: string, label: string }>
- `error`: string
- Additional HTML select props

### Data Display Components

#### DataTable

```javascript
// components/ui/DataTable.jsx
"use client";

export default function DataTable({
  columns,
  data,
  pagination,
  onRowClick,
  ...props
}) {
  // Implementation
}
```

**Props:**

- `columns`: Array<Column>
- `data`: Array<any>
- `pagination`: boolean
- `onRowClick`: function

#### Card

```javascript
// components/ui/Card.jsx
"use client";

export default function Card({ title, children, footer, ...props }) {
  // Implementation
}
```

**Props:**

- `title`: string
- `children`: ReactNode
- `footer`: ReactNode

### Feature Components

#### WorkoutPlanCard

```javascript
// components/features/WorkoutPlanCard.jsx
"use client";

export default function WorkoutPlanCard({ plan, onEdit, onDelete, ...props }) {
  // Implementation
}
```

**Props:**

- `plan`: WorkoutPlan
- `onEdit`: function
- `onDelete`: function

#### NutritionLogForm

```javascript
// components/features/NutritionLogForm.jsx
"use client";

export default function NutritionLogForm({ onSubmit, initialData, ...props }) {
  // Implementation
}
```

**Props:**

- `onSubmit`: function
- `initialData`: NutritionLog

### Modal Components

#### Modal

```javascript
// components/ui/Modal.jsx
"use client";

export default function Modal({ isOpen, onClose, title, children, ...props }) {
  // Implementation
}
```

**Props:**

- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `children`: ReactNode

#### ConfirmDialog

```javascript
// components/ui/ConfirmDialog.jsx
"use client";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  ...props
}) {
  // Implementation
}
```

**Props:**

- `isOpen`: boolean
- `onClose`: function
- `onConfirm`: function
- `title`: string
- `message`: string

### Chart Components

#### ProgressChart

```javascript
// components/charts/ProgressChart.jsx
"use client";

export default function ProgressChart({ data, type, ...props }) {
  // Implementation
}
```

**Props:**

- `data`: Array<DataPoint>
- `type`: 'weight' | 'workout' | 'nutrition'

#### StatsCard

```javascript
// components/charts/StatsCard.jsx
"use client";

export default function StatsCard({ title, value, change, ...props }) {
  // Implementation
}
```

**Props:**

- `title`: string
- `value`: number | string
- `change`: number

## Component Guidelines

### Styling

- Use Tailwind CSS utility classes
- Follow the design system color palette
- Maintain consistent spacing
- Ensure responsive design

### Accessibility

- Include proper ARIA labels
- Maintain keyboard navigation
- Ensure proper color contrast
- Support screen readers

### Performance

- Implement proper memoization
- Lazy load when appropriate
- Optimize re-renders
- Use proper loading states

### State Management

- Use React Context for global state
- Implement proper form handling
- Manage loading and error states
- Handle data fetching efficiently

## Component Testing

### Unit Tests

```javascript
// __tests__/components/FormInput.test.js
describe("FormInput", () => {
  it("renders correctly", () => {
    // Test implementation
  });

  it("handles errors", () => {
    // Test implementation
  });
});
```

### Integration Tests

```javascript
// __tests__/components/WorkoutPlanCard.test.js
describe("WorkoutPlanCard", () => {
  it("interacts correctly", () => {
    // Test implementation
  });
});
```

## Component Documentation

Each component should include:

1. **Purpose**: Clear description of the component's role
2. **Props**: Detailed prop documentation
3. **Usage**: Example usage code
4. **Accessibility**: Accessibility considerations
5. **Performance**: Performance considerations
6. **Testing**: Testing requirements
