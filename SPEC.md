# Firework Message - Project Specification

## 1. Project Overview

**Project Name:** Firework Message  
**Type:** Web Application (Next.js)  
**Core Functionality:** A romantic/personal message sharing app where users can create custom fireworks displays with personalized messages and optional image-to-firework transformation  
**Target Users:** Anyone wanting to send visual messages for celebrations, surprises, or romantic gestures  
**Deployment:** Vercel

---

## 2. UI/UX Specification

### 2.1 Page Structure

**Page 1: Landing Page (`/`)**  
- Clean, elegant input interface
- Message input field (optional)
- Image upload area (optional)
- Start button to trigger the experience

**Page 2: Firework Display (`/show`)**  
- Full-screen black canvas
- Fireworks animation
- Message reveal with fade-in effect
- Image-to-firework particles (if image uploaded)
- Share button overlay

### 2.2 Visual Design

#### Color Palette
| Usage | Color | Hex |
|-------|-------|-----|
| Background (Landing) | Deep Midnight | `#0a0a0f` |
| Background (Show) | Pure Black | `#000000` |
| Primary Accent | Electric Pink | `#ff2d75` |
| Secondary Accent | Golden Gold | `#ffd700` |
| Tertiary Accent | Cyan Spark | `#00f5ff` |
| Text Primary | Soft White | `#f5f5f5` |
| Text Secondary | Muted Gray | `#888899` |
| Input Background | Dark Glass | `rgba(255,255,255,0.05)` |
| Button Gradient Start | Hot Pink | `#ff2d75` |
| Button Gradient End | Orange Fire | `#ff6b35` |

#### Typography
- **Font Family:** 
  - Headings: `Playfair Display` (elegant serif)
  - Body: `Quicksand` (friendly, modern sans)
- **Sizes:**
  - Main Heading: 3rem (48px)
  - Subheading: 1.25rem (20px)
  - Body: 1rem (16px)
  - Message Display: 4rem (64px)
  - Button: 1.125rem (18px)

#### Spacing System
- Base unit: 8px
- Section padding: 64px (8 units)
- Element gaps: 24px (3 units)
- Input padding: 16px (2 units)

#### Visual Effects
- Glassmorphism on input containers
- Subtle glow on buttons (box-shadow with accent color)
- Particle trails on fireworks
- Smooth fade-in for message reveal
- Floating animation for UI elements

### 2.3 Components

#### Landing Page Components

1. **Header**
   - App title with subtle glow animation
   - Tagline below

2. **Message Input**
   - Large textarea with placeholder "Nhập thông điệp của bạn..."
   - Character count display
   - Optional field

3. **Image Upload**
   - Drag & drop zone with dashed border
   - Preview thumbnail after upload
   - "X" button to remove
   - Accepts: jpg, png, gif, webp

4. **Start Button**
   - Large, prominent button
   - Gradient background (pink to orange)
   - Hover: scale up slightly, intensify glow
   - Click: ripple effect

#### Firework Display Components

1. **Canvas**
   - Full viewport width/height
   - Black background
   - Fireworks rendered via canvas API

2. **Firework Particle System**
   - Multiple simultaneous fireworks (5-8)
   - Various colors from palette
   - Trail effects
   - Explosion patterns (radial bursts)

3. **Message Display**
   - Centered on screen
   - Large, elegant typography
   - Fade-in animation after 2s delay
   - Text shadow for readability

4. **Share Button**
   - Fixed position (bottom-right)
   - Icon + "Chia sẻ" text
   - Click opens share dialog

5. **Image Particles** (if image uploaded)
   - Image splits into particles
   - Particles become part of firework explosion
   - Fragments float down gracefully

---

## 3. Functionality Specification

### 3.1 Core Features

#### Feature 1: Message Input
- Text input field with max 500 characters
- Optional - can be empty
- Stores in URL query params for sharing
- Supports Unicode/Vietnamese characters

#### Feature 2: Image Upload
- Accepts: jpg, jpeg, png, gif, webp
- Max file size: 5MB
- Converts to base64 for URL sharing
- Optional - can be empty
- Image processed into particle colors

#### Feature 3: Fireworks Animation
- Uses HTML5 Canvas
- Multiple fireworks launching simultaneously
- Random launch positions (upper half of screen)
- Various explosion sizes and patterns
- Continuous loop until page closed
- Particle physics (gravity, fade, trails)

#### Feature 4: Message Reveal
- Triggers 2 seconds after page load
- Fade-in animation (1.5s duration)
- Stays visible for rest of session

#### Feature 5: Image to Firework
- Extract dominant colors from uploaded image
- Use those colors for firework particles
- Optional particle explosion effect using image

#### Feature 6: Share Functionality
- Uses Web Share API if available
- Falls back to clipboard copy
- Shares URL with message/image data encoded

### 3.2 User Flows

**Flow 1: Basic Usage**
1. User opens landing page
2. User enters message (optional)
3. User clicks "Bắt đầu"
4. Redirects to firework page
5. Fireworks launch immediately
6. Message fades in after 2s
7. User can share or return home

**Flow 2: With Image**
1. User opens landing page
2. User enters message (optional)
3. User uploads image (optional)
4. User clicks "Bắt đầu"
5. Redirects to firework page
6. Fireworks use image colors
7. Image particles explode with fireworks

**Flow 3: Sharing**
1. User views firework display
2. User clicks "Chia sẻ"
3. If Web Share available: native share dialog
4. Else: URL copied to clipboard
5. Recipient opens link: sees same message + fireworks

### 3.3 Technical Implementation

- **Framework:** Next.js 14 (App Router)
- **Styling:** CSS Modules
- **Animation:** Canvas API + CSS animations
- **State:** React hooks (useState, useEffect)
- **Sharing:** Web Share API + Clipboard API
- **Image Processing:** Canvas for color extraction

### 3.4 Edge Cases

1. Empty message + no image: Show generic celebration fireworks
2. Very long message: Truncate display with ellipsis, full text in tooltip
3. Large image: Compress before converting to base64
4. No Web Share API: Fall back to clipboard copy
5. Mobile: Responsive layout, touch-friendly buttons

---

## 4. Acceptance Criteria

### Visual Checkpoints
- [ ] Landing page has dark theme with glassmorphism inputs
- [ ] Start button has gradient and glow effect
- [ ] Firework page is pure black background
- [ ] Multiple fireworks launch simultaneously
- [ ] Message fades in smoothly after 2s
- [ ] Image upload shows preview thumbnail
- [ ] Share button is visible and accessible

### Functional Checkpoints
- [ ] Message can be entered and persists to show page
- [ ] Image can be uploaded and shows preview
- [ ] Fireworks animate continuously
- [ ] Share button opens share dialog or copies URL
- [ ] URL with params works for sharing
- [ ] Empty message/image shows default fireworks
- [ ] Responsive on mobile devices

### Performance Checkpoints
- [ ] Page loads under 3 seconds
- [ ] Fireworks run at 60fps
- [ ] No memory leaks from animation
- [ ] Works on Chrome, Firefox, Safari, Edge
