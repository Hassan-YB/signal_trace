# Frontend Architecture Guidelines

## Core Principles

This project follows Next.js and React best practices with a focus on consistent styling, component structure, and maintainability.

### Architecture Pattern

```
┌─────────────────┐
│   Page (Route)  │  ← Next.js page component, minimal code, uses layout components
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Components    │  ← Reusable UI components with consistent styling
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Styling       │  ← Tailwind CSS with standardized spacing and design tokens
└─────────────────┘
```

## Key Rules

### 1. Page Structure

All pages follow a consistent structure:

```tsx
import Component from '@/app/components/ComponentName'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Name | Signal Trace',
}

export default function PageName() {
  return (
    <>
      <Breadcrumb pageName='Page Name' />
      <Component />
    </>
  )
}
```

**Rules:**
- Pages are thin wrappers that compose components
- Always include Breadcrumb component (except homepage)
- Always include Metadata for SEO
- Use descriptive page names in metadata title

### 2. Layout Structure

#### Standard Page Layout (with Breadcrumb)

```tsx
<>
  <Breadcrumb pageName='Page Name' />
  <div className='min-h-screen bg-slate-100'>
    <div className='container mx-auto px-4 pb-8'>
      {/* Content here */}
    </div>
  </div>
</>
```

**Key Points:**
- Background: `bg-slate-100` (grayish background)
- Container: `container mx-auto px-4`
- Padding: Only `pb-8` (bottom padding), NO top padding
- Full height: `min-h-screen`

#### Form/Content Card Layout

```tsx
<div className='rounded-xl border border-gray-200 bg-white p-[22px] shadow-sm'>
  {/* Form or content here */}
</div>
```

**Key Points:**
- Card styling: `rounded-xl border border-gray-200 bg-white shadow-sm`
- Padding: `p-[22px]` (22px on all sides)
- Always use exact pixel values for consistency

### 3. Spacing System

**Standard Spacing: 22px**

All spacing between form elements, sections, and content blocks uses **22px**:

```tsx
// Section spacing
<div className='mb-[22px]'>
  {/* Content */}
</div>

// Form field spacing
<div className='mb-[22px]'>
  <input />
</div>
```

**Spacing Rules:**
- Between form fields: `mb-[22px]`
- Between sections: `mb-[22px]`
- Title section wrapper: `mb-[22px]`
- After form: `mt-[22px]` (if needed)

### 4. Typography

#### Page Title (in Breadcrumb)
```tsx
<h1 className='text-black mb-2 mt-2 text-3xl font-bold sm:text-4xl md:text-[40px] md:leading-[1.2]'>
  {pageName}
</h1>
```

#### Section Title (in Cards/Forms)
```tsx
<h2 className='text-2xl font-bold text-gray-900 leading-none'>
  Section Title
</h2>
```

**Key Points:**
- Section titles: `text-2xl font-bold text-gray-900 leading-none`
- Line height: `leading-none` (line-height: 1) for section titles
- Description spacing: `mt-[10px]` below title

#### Description Text
```tsx
<p className='mt-[10px] text-sm text-gray-600'>
  Description text here
</p>
```

**Key Points:**
- Description: `text-sm text-gray-600`
- Spacing: `mt-[10px]` (10px top margin) below title

### 5. Form Styling

#### Form Structure
```tsx
<div className='rounded-xl border border-gray-200 bg-white p-[22px] shadow-sm'>
  <div className='mb-[22px]'>
    <h2 className='text-2xl font-bold text-gray-900 leading-none'>Form Title</h2>
    <p className='mt-[10px] text-sm text-gray-600'>Form description</p>
  </div>

  <form onSubmit={handleSubmit}>
    <div className='mb-[22px]'>
      <label className='block text-sm font-medium text-gray-700 mb-2'>
        Label
      </label>
      <input
        className='w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
      />
    </div>
    {/* More fields with mb-[22px] */}
  </form>
</div>
```

#### Input Field Styling
```tsx
<input
  className='w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
/>
```

**Input Rules:**
- Width: `w-full`
- Border radius: `rounded-lg`
- Padding: `px-4 py-3`
- Text: `text-base text-gray-900`
- Focus: `focus:border-primary focus:ring-2 focus:ring-primary/20`
- Transition: `transition-all duration-200`

#### Label Styling
```tsx
<label className='block text-sm font-medium text-gray-700 mb-2'>
  Label Text
</label>
```

**Label Rules:**
- Display: `block`
- Text: `text-sm font-medium text-gray-700`
- Spacing: `mb-2` (8px bottom margin)

#### Textarea Styling
```tsx
<textarea
  className='w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none'
  rows={6}
/>
```

#### Button Styling

**Full Width Button (Auth forms):**
```tsx
<button
  className='w-full rounded-lg border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:border-gray-400 disabled:hover:bg-gray-400'
>
  Button Text
</button>
```

**Auto Width Button (Contact/Other forms):**
```tsx
<button
  className='rounded-lg border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:border-gray-400 disabled:hover:bg-gray-400'
>
  Button Text
</button>
```

**Button Rules:**
- Auth forms: Use `w-full` for full width
- Other forms: Remove `w-full` for auto width
- Padding: `px-5 py-3`
- Border radius: `rounded-lg`
- Disabled states: Proper disabled styling

### 6. Error Handling

#### Error Message Styling
```tsx
{errors.fieldName && (
  <p className='mt-1 text-sm text-red-500'>{errors.fieldName}</p>
)}
```

**Error Rules:**
- Spacing: `mt-1` (4px top margin)
- Text: `text-sm text-red-500`
- Display: Below the input field

#### Error Input Styling
```tsx
<input
  className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
    errors.fieldName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
  }`}
/>
```

### 7. Color System

**Background Colors:**
- Page background: `bg-slate-100` (grayish)
- Card/Form background: `bg-white`
- Primary color: `bg-primary` (defined in theme)

**Text Colors:**
- Headings: `text-gray-900`
- Body text: `text-gray-600`
- Labels: `text-gray-700`
- Errors: `text-red-500`

**Border Colors:**
- Default: `border-gray-300`
- Focus: `border-primary`
- Error: `border-red-500`

### 8. Component Organization

```
src/app/
├── (site)/              # Route groups
│   ├── (auth)/          # Auth routes
│   │   └── signin/
│   │       └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   └── contact-us/
│       └── page.tsx
└── components/          # Reusable components
    ├── Auth/
    ├── Common/
    ├── Contact/
    └── Profile/
```

**Component Rules:**
- Page components: In `(site)/` route groups
- Reusable components: In `components/` directory
- Component files: Use `index.tsx` for main component
- One component per file

### 9. Form Validation

#### Form State Management
```tsx
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
})

const [errors, setErrors] = useState<Record<string, string>>({})
const [isFormValid, setIsFormValid] = useState(false)
```

#### Validation Pattern
```tsx
useEffect(() => {
  const isValid = 
    formData.field1.trim() !== '' &&
    formData.field2.trim() !== ''
  setIsFormValid(isValid)
}, [formData])
```

### 10. API Integration

#### Using API Request Helper
```tsx
import { apiRequest } from '@/utils/api'

const response = await apiRequest<ResponseType>(
  '/api/endpoint/',
  {
    method: 'POST',
    body: JSON.stringify(formData),
  },
  false // requireAuth: false for public endpoints
)
```

**API Rules:**
- Use `apiRequest` from `@/utils/api`
- Specify response type with TypeScript generics
- Set `requireAuth: false` for public endpoints
- Handle success/error responses consistently

## Standard Page Templates

### Auth Form Page Template
```tsx
import Component from '@/app/components/Auth/ComponentName'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Name | Signal Trace',
}

export default function PageName() {
  return (
    <>
      <Breadcrumb pageName='Page Name' />
      <div className='min-h-screen bg-slate-100'>
        <div className='container mx-auto px-4 pb-8'>
          <div className='flex justify-center'>
            <div className='w-full max-w-md'>
              <Component />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
```

### Content Page Template
```tsx
import Component from '@/app/components/ComponentName'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Name | Signal Trace',
}

export default function PageName() {
  return (
    <>
      <Breadcrumb pageName='Page Name' />
      <Component />
    </>
  )
}
```

### Form Component Template
```tsx
'use client'
import { useState, useEffect } from 'react'
import { apiRequest } from '@/utils/api'
import toast from 'react-hot-toast'

const FormComponent = () => {
  const [formData, setFormData] = useState({
    field1: '',
    field2: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const isValid = 
      formData.field1.trim() !== '' &&
      formData.field2.trim() !== ''
    setIsFormValid(isValid)
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiRequest<ResponseType>(
        '/api/endpoint/',
        {
          method: 'POST',
          body: JSON.stringify(formData),
        },
        false
      )

      if (response.success) {
        toast.success(response.message || 'Success!')
        // Reset form or redirect
      } else {
        if (response.errors) {
          setErrors(response.errors)
        }
        toast.error(response.message || 'An error occurred')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-slate-100'>
      <div className='container mx-auto px-4 pb-8'>
        <div className='flex justify-center'>
          <div className='w-full max-w-2xl'>
            <div className='rounded-xl border border-gray-200 bg-white p-[22px] shadow-sm'>
              <div className='mb-[22px]'>
                <h2 className='text-2xl font-bold text-gray-900 leading-none'>Form Title</h2>
                <p className='mt-[10px] text-sm text-gray-600'>Form description</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className='mb-[22px]'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Field Label
                  </label>
                  <input
                    type='text'
                    value={formData.field1}
                    onChange={(e) => setFormData({ ...formData, field1: e.target.value })}
                    className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      errors.field1 ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    }`}
                  />
                  {errors.field1 && (
                    <p className='mt-1 text-sm text-red-500'>{errors.field1}</p>
                  )}
                </div>

                <div className='mb-[22px]'>
                  <button
                    type='submit'
                    disabled={!isFormValid || loading}
                    className='rounded-lg border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:border-gray-400 disabled:hover:bg-gray-400'
                  >
                    {loading ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormComponent
```

## Benefits

- **Consistency**: All pages follow the same structure and styling
- **Maintainability**: Easy to update styling across all pages
- **Scalability**: Clear patterns for adding new pages
- **Developer Experience**: New developers can quickly understand the codebase
- **User Experience**: Consistent UI/UX across the application

## When Adding New Pages

1. Create page file in appropriate route group `(site)/`
2. Include Breadcrumb component (except homepage)
3. Use standard layout structure with `bg-slate-100` background
4. Use `p-[22px]` for card padding
5. Use `mb-[22px]` for spacing between elements
6. Use `leading-none` for section titles
7. Use `mt-[10px]` for description spacing below titles
8. Follow form styling patterns for any forms
9. Include proper Metadata for SEO
10. Use TypeScript types for all props and state

## Quick Reference

### Spacing
- Standard spacing: `22px` → `mb-[22px]` or `p-[22px]`
- Description spacing: `10px` → `mt-[10px]`
- Label spacing: `8px` → `mb-2`
- Error spacing: `4px` → `mt-1`

### Typography
- Section title: `text-2xl font-bold text-gray-900 leading-none`
- Description: `text-sm text-gray-600`
- Label: `text-sm font-medium text-gray-700`

### Colors
- Background: `bg-slate-100` (page), `bg-white` (card)
- Text: `text-gray-900` (headings), `text-gray-600` (body), `text-gray-700` (labels)
- Primary: `bg-primary`, `text-primary`, `border-primary`
- Error: `text-red-500`, `border-red-500`

### Layout
- Page wrapper: `min-h-screen bg-slate-100`
- Container: `container mx-auto px-4 pb-8` (NO top padding)
- Card: `rounded-xl border border-gray-200 bg-white p-[22px] shadow-sm`

