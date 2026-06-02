---
name: Velocity Driver
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5e3f3a'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#926e69'
  outline-variant: '#e8bdb6'
  surface-tint: '#c00000'
  primary: '#9e0000'
  on-primary: '#ffffff'
  primary-container: '#cc0000'
  on-primary-container: '#ffdad4'
  inverse-primary: '#ffb4a8'
  secondary: '#705d00'
  on-secondary: '#ffffff'
  secondary-container: '#fcd400'
  on-secondary-container: '#6e5c00'
  tertiary: '#9e0100'
  on-tertiary: '#ffffff'
  tertiary-container: '#cc0000'
  on-tertiary-container: '#ffdad4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#930000'
  secondary-fixed: '#ffe16d'
  secondary-fixed-dim: '#e9c400'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#ffb4a8'
  on-tertiary-fixed: '#410000'
  on-tertiary-fixed-variant: '#930100'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style
The design system is engineered for high-performance logistics, focusing on speed, clarity, and reliability. The brand personality is energetic and authoritative, designed to instill confidence in drivers who operate in fast-paced, high-pressure environments. 

The aesthetic follows a **Modern Corporate** approach with **High-Contrast** utility. It prioritizes glanceable information architecture, ensuring that critical delivery data is legible under varying lighting conditions, from bright midday sun to night-time urban environments. The interface uses bold color blocks and intentional whitespace to reduce cognitive load, allowing drivers to make split-second decisions safely.

## Colors
The color palette is rooted in high-visibility signals. 

- **Primary (#CC0000):** Used for the most critical actions and brand presence. It signals "Action" and "Urgency."
- **Secondary (#FFD700):** A bright, high-contrast yellow used for secondary CTAs, warnings, or financial highlights (earnings). It provides a distinct visual break from the red.
- **Tertiary/Primary Light (#E80000):** Reserved for interactive states, hover effects, or highlighting active navigation paths.
- **Neutrals:** The background uses a soft gray (#F5F5F5) to reduce glare compared to pure white, while pure white (#FFFFFF) is reserved for card surfaces to create a clear "layer" effect. Text uses a deep black (#111111) to maximize the contrast ratio for accessibility.

## Typography
The design system utilizes **Plus Jakarta Sans** for its exceptional legibility and modern, slightly rounded geometric character. 

- **Weight Strategy:** Use Bold (700) and ExtraBold (800) for critical delivery information like "Address" or "Order Total." This ensures information is readable even if the device is mounted on a vibrating dashboard.
- **Scaling:** Headlines scale down aggressively on mobile to prevent text wrapping, which can disrupt the vertical rhythm of the delivery queue.
- **Labels:** Small labels use a heavy weight and uppercase transformation to differentiate metadata (e.g., "ESTIMATED TIME") from primary content.

## Layout & Spacing
The layout follows a **Fluid Grid** model designed for mobile-first utility. 

- **Rhythm:** An 8px grid system (with a 4px baseline for tight components) ensures consistent vertical spacing.
- **Touch Targets:** All interactive elements must maintain a minimum height of 48px to accommodate one-handed operation while wearing gloves or moving.
- **Margins:** A standard 20px side margin provides a "safe zone" for drivers holding their devices. 
- **Structure:** Content is organized into a single-column stack on mobile to focus the driver's attention on one task at a time. Tablet layouts may utilize a split-view for map and order details.

## Elevation & Depth
Depth is used functionally to indicate the hierarchy of tasks. 

- **Level 0 (Background):** The #F5F5F5 surface for the app canvas.
- **Level 1 (Cards):** Pure white surfaces with a soft, 12% opacity neutral shadow. This level is used for inactive or secondary information cards.
- **Level 2 (Active Tasks):** Cards representing the current delivery use a more pronounced, 18% opacity shadow with a subtle 1px border in #E80000 to draw the eye immediately.
- **Tonal Layers:** For background elements like maps, semi-transparent dark overlays (scrims) are used when modals or bottom sheets are active to ensure focus remains on the action.

## Shapes
This design system employs a **Rounded** shape language to soften the industrial nature of logistics. 

- **Standard Radius:** 0.5rem (8px) for buttons and input fields to provide a friendly, modern feel.
- **Large Radius:** 1rem (16px) for main content cards and containers.
- **Extra Large Radius:** 1.5rem (24px) for bottom sheets and prominent modal headers.
- **Pills:** Status indicators (e.g., "On the way") always use a fully rounded pill shape to distinguish them from actionable buttons.

## Components
- **Primary Action (Recoger):** Large, full-width button using Primary Red (#CC0000) with white centered text. This is the "high-urgency" button.
- **Secondary Action (Comprar):** High-visibility Yellow (#FFD700) with black text. This provides a clear visual distinction from the brand red, signaling a different phase of the driver's workflow.
- **Delivery Cards:** Large white containers with rounded corners. The address should be in Headline-MD; secondary details in Body-MD.
- **Input Fields:** 56px height with an 8px radius. Use a 2px border on focus in Primary Red. Labels should persist (floating labels) so drivers don't lose context.
- **Chips:** Small, rounded-pill containers with background tints. Use a light red background with dark red text for "Urgent" orders and a light gray background for "Scheduled" orders.
- **Bottom Sheets:** Used for navigation and order details. They must include a prominent grab-handle and snap to 50% or 100% of the viewport height.