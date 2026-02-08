# 🎨 Visual Guide - Paoday CRM

This guide shows you what the CRM interface looks like and how to use it.

## 🏠 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [P] Paoday CRM                                    [◀]      │  ← Collapsible Sidebar
│  ════════════════                                           │
│  🏠 Home                                                    │
│  📊 CRM Pipeline  ← You are here                           │
│  👥 Contacts                                                │
│  🏢 Companies                                               │
│  📄 Documents                                               │
│  ⚙️  Settings                                               │
│  ────────────────                                           │
│  🚪 Logout                                                  │
└─────────────────────────────────────────────────────────────┘
```

## 📊 CRM Pipeline View

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  CRM Pipeline                                                                │
│  Drag and drop deals between stages to update their status                  │
│                                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ PIPELINE │  │  ACTIVE  │  │  PASSED  │  │ INVESTED │                   │
│  │ 🔵       │  │ 🟢       │  │ ⚫       │  │ 🟣       │                   │
│  │ 2 deals  │  │ 2 deals  │  │ 1 deal   │  │ 1 deal   │                   │
│  │ $1.25M   │  │ $3M      │  │ $300K    │  │ $3M      │                   │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤                   │
│  │          │  │          │  │          │  │          │                   │
│  │ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │                   │
│  │ │ [🏢] │ │  │ │ [🏢] │ │  │ │ [🏢] │ │  │ │ [🏢] │ │  ← Deal Cards     │
│  │ │Tech   │ │  │ │Scale │ │  │ │Next  │ │  │ │Fin   │ │                   │
│  │ │Start  │ │  │ │Up    │ │  │ │Gen   │ │  │ │Tech  │ │                   │
│  │ │       │ │  │ │      │ │  │ │AI    │ │  │ │Pro   │ │                   │
│  │ │$500K  │ │  │ │$2M   │ │  │ │$300K │ │  │ │$3M   │ │                   │
│  │ │👤 John│ │  │ │👤Sara│ │  │ │👤John│ │  │ │👤Sara│ │                   │
│  │ │📅 2d  │ │  │ │📅 3h │ │  │ │📅 30d│ │  │ │📅 10d│ │                   │
│  │ └──────┘ │  │ └──────┘ │  │ └──────┘ │  │ └──────┘ │                   │
│  │          │  │          │  │          │  │          │                   │
│  │ ┌──────┐ │  │ ┌──────┐ │  │          │  │          │                   │
│  │ │ [🏢] │ │  │ │ [🏢] │ │  │          │  │          │                   │
│  │ │Innov │ │  │ │Growth│ │  │          │  │          │                   │
│  │ │ate   │ │  │ │Co    │ │  │          │  │          │                   │
│  │ │Lab   │ │  │ │      │ │  │          │  │          │                   │
│  │ │$750K │ │  │ │$1M   │ │  │          │  │          │                   │
│  │ │👤 John│ │  │ │👤Sara│ │  │          │  │          │                   │
│  │ │📅 5d  │ │  │ │📅 1d │ │  │          │  │          │                   │
│  │ └──────┘ │  │ └──────┘ │  │          │  │          │                   │
│  │          │  │          │  │          │  │          │                   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 💳 Deal Card Anatomy

```
┌────────────────────────────────┐
│  [🏢] TechStart Inc      [⋮]  │  ← Company icon + More options
│                                │
│  💵 $500,000                   │  ← Deal amount
│                                │
│  👤 John Doe                   │  ← Owner/Assigned to
│  📅 2 days ago                 │  ← Last contact
│  ──────────────────────────    │
│  Initial contact made,         │  ← Notes preview
│  interested in Series A        │
│  ──────────────────────────    │
│  Contact: Jane Smith           │  ← Contact person
└────────────────────────────────┘
```

## 🎯 Dashboard Statistics

```
┌──────────────────────────────────────────────────────────────────┐
│  Welcome back!                                                   │
│  user@example.com                                                │
│                                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │ [🎯]    │  │ [📈]    │  │ [👥]    │  │ [💰]    │           │
│  │   6     │  │   2     │  │   2     │  │ $6.8M   │           │
│  │ Total   │  │ Active  │  │Pipeline │  │  Value  │           │
│  │ Deals   │  │ Deals   │  │ Deals   │  │         │           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
│                                                                  │
│  Quick Actions                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ [🎯]         │  │ [👥]         │  │ [📈]         │         │
│  │ View         │  │ Add          │  │ New          │         │
│  │ Pipeline     │  │ Contact      │  │ Deal         │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  Recent Deals                                                    │
│  ┌────────────────────────────────────────────────┐            │
│  │ [T] TechStart Inc      John Doe  [Pipeline] $500K │         │
│  │ [G] GrowthCo          Sarah J.   [Active]   $1M   │         │
│  │ [I] InnovateLab       John Doe   [Pipeline] $750K │         │
│  └────────────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

### Stage Colors
- **Pipeline (Blue):**   Background: `#EFF6FF`, Text: `#1E40AF`, Icon: `#3B82F6`
- **Active (Green):**    Background: `#F0FDF4`, Text: `#15803D`, Icon: `#10B981`
- **Passed (Gray):**     Background: `#F9FAFB`, Text: `#374151`, Icon: `#6B7280`
- **Invested (Purple):** Background: `#FAF5FF`, Text: `#6B21A8`, Icon: `#8B5CF6`

### UI Elements
- **Sidebar:** `#1F2937` (Dark Gray)
- **Background:** `#F3F4F6` (Light Gray)
- **Cards:** `#FFFFFF` (White)
- **Text Primary:** `#111827` (Almost Black)
- **Text Secondary:** `#6B7280` (Gray)

## 🖱️ Interactions

### Drag and Drop
1. **Hover over card** → Cursor changes to grab
2. **Click and hold** → Card lifts and rotates slightly
3. **Drag to column** → Column highlights with blue border
4. **Release** → Card drops, database updates
5. **Success** → Card stays in new column

### Sidebar
1. **Click toggle button** → Sidebar collapses to icons only
2. **Click again** → Sidebar expands with full text
3. **Click menu item** → Navigate to that page
4. **Active page** → Highlighted in blue

### Cards
1. **Hover** → Shadow increases, more button appears
2. **Click and drag** → Move between stages
3. **Click more button (⋮)** → Future: Show options menu

## 📱 Responsive Behavior

### Desktop (> 1024px)
- Full sidebar (256px)
- 4 columns side by side
- All card details visible

### Tablet (768px - 1024px)
- Sidebar can collapse
- 2-3 columns visible
- Horizontal scroll for remaining columns

### Mobile (< 768px)
- Sidebar as overlay/drawer
- 1 column at a time
- Horizontal scroll between stages

## ✨ Visual Effects

### Animations
- Sidebar toggle: 300ms ease
- Card drag: Smooth transform
- Hover effects: 150ms ease
- Drop zone: Instant feedback

### Shadows
- Cards: `shadow-sm` → `shadow-md` on hover
- Sidebar: `shadow-xl` (fixed)
- Columns: `shadow-sm` (subtle)

### Gradients
- Company icons: Blue → Purple diagonal
- Quick action buttons: Subtle color gradients
- Stage headers: Solid colors with subtle texture

## 🎯 Best Practices

### Using the CRM
1. **Start in Pipeline** - New prospects go here
2. **Move to Active** - When you're in talks/due diligence
3. **Mark as Passed** - If deal doesn't proceed
4. **Move to Invested** - When investment is complete

### Card Organization
- Keep similar deals together
- Use consistent naming
- Update last contact regularly
- Add meaningful notes

### Visual Hierarchy
- Most important info at top (company, amount)
- Supporting details below (owner, contact)
- Notes at bottom (can truncate)

---

This Monday.com-inspired interface makes it easy to track your deals visually and move them through your investment pipeline! 🚀
