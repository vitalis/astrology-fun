# Konsta UI Integration Guide

## Overview

This project now includes **Konsta UI v5** for Svelte, a pixel-perfect mobile UI component library with iOS and Material Design themes.

## Installation

Already installed:
- `konsta` - Konsta UI component library
- `framework7-svelte` - Framework7 for Svelte (optional, works alongside Konsta)

## Theme Configuration

### Custom Colors

Custom theme colors are defined in `src/app.css` using Tailwind v4's `@theme` declaration:

```css
@theme {
  /* Primary brand color - cosmic indigo/purple */
  --color-brand-primary: #6366f1;

  /* Secondary colors for astrology theme */
  --color-brand-secondary: #8b5cf6;
  --color-brand-accent: #ec4899;
  --color-brand-cosmic: #3730a3;
}
```

### Available Color Classes

To apply custom colors to Konsta components, use the `k-color-[name]` class:

- `k-color-brand-primary` - Indigo (#6366f1)
- `k-color-brand-secondary` - Purple (#8b5cf6)
- `k-color-brand-accent` - Pink (#ec4899)
- `k-color-brand-cosmic` - Deep Indigo (#3730a3)

## Usage Examples

### Basic Button

```svelte
<script>
  import { Button } from 'konsta/svelte';
</script>

<!-- Default primary color -->
<Button>Default Button</Button>

<!-- Custom secondary color -->
<Button class="k-color-brand-secondary">Purple Button</Button>

<!-- Custom accent color -->
<Button class="k-color-brand-accent">Pink Button</Button>
```

### List with Custom Color

```svelte
<script>
  import { List, ListItem } from 'konsta/svelte';
</script>

<List class="k-color-brand-cosmic">
  <ListItem title="Item 1" />
  <ListItem title="Item 2" />
</List>
```

### Card Component

```svelte
<script>
  import { Card, CardHeader, CardContent } from 'konsta/svelte';
</script>

<Card>
  <CardHeader>
    <h2>Astrology Chart</h2>
  </CardHeader>
  <CardContent>
    Your birth chart information...
  </CardContent>
</Card>
```

### Navbar

```svelte
<script>
  import { Navbar } from 'konsta/svelte';
</script>

<Navbar title="Birth Chart Calculator" class="k-color-brand-primary" />
```

### Block (Content Container)

```svelte
<script>
  import { Block } from 'konsta/svelte';
</script>

<Block strong inset>
  <p>Some important content</p>
</Block>
```

## Theme Detection

The app automatically detects iOS devices and applies the appropriate theme:

- **iOS devices** → iOS theme (`k-ios`)
- **Other devices** → Material Design theme (`k-material`)

This is configured in `src/routes/+layout.svelte`:

```svelte
const isIOS = typeof window !== 'undefined' &&
  /iPad|iPhone|iPod/.test(navigator.userAgent);
const theme = isIOS ? 'ios' : 'material';
```

## Available Components

Konsta UI includes 40+ mobile-optimized components:

### Navigation
- Navbar
- Toolbar
- Tabbar
- Link

### Layout
- Page
- Block
- List / ListItem
- Card

### Form Elements
- Button
- Input
- Checkbox
- Radio
- Toggle
- Range
- Stepper
- Segmented

### Popups & Overlays
- Popup
- Sheet
- Dialog
- Actions
- Toast

### Advanced
- Accordion
- Badge
- Chip
- Fab
- Icon
- Menu
- Panel
- Popover
- Preloader

## Customizing More Colors

To add more custom colors, update `src/app.css`:

```css
@theme {
  --color-brand-primary: #6366f1;
  --color-brand-secondary: #8b5cf6;
  --color-brand-accent: #ec4899;
  --color-brand-cosmic: #3730a3;

  /* Add your own colors */
  --color-brand-sun: #fbbf24;
  --color-brand-moon: #e0e7ff;
  --color-brand-mars: #dc2626;
}
```

Then use them with `k-color-brand-sun`, `k-color-brand-moon`, etc.

## Documentation

- **Konsta UI Docs**: https://konstaui.com/svelte
- **Framework7 Docs**: https://framework7.io/svelte
- **Component Examples**: https://konstaui.com/svelte/button

## Notes

- Konsta UI works seamlessly with your existing Tailwind CSS v4 setup
- All Konsta components are tree-shakeable (only imported components are bundled)
- The theme automatically adapts to dark mode using Tailwind's dark mode detection
- Custom colors inherit from parent elements when using `k-color-[name]` class
