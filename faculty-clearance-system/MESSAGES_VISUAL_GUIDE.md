# Messages Page - Visual Layout & Components Guide

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Faculty Dashboard                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📧 Messages                                                      │ │
│ │ Chat with departments about your clearance requests             │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌──────────────────────┬──────────────────────────────────────────┐ │
│ │   CONVERSATIONS      │         CHAT WINDOW                       │ │
│ │   (Left Panel)       │         (Right Panel)                     │ │
│ │                      │                                           │ │
│ │ ┌────────────────┐   │ ┌────────────────────────────────────┐   │ │
│ │ │  Conversations │   │ │ Library                      ℹ️ ⋯     │   │ │
│ │ └────────────────┘   │ │ 5 messages                         │   │ │
│ │                      │ └────────────────────────────────────┘   │ │
│ │ ┌────────────────┐   │                                           │ │
│ │ │ 🔍 Search...  │   │ ┌────────────────────────────────────┐   │ │
│ │ └────────────────┘   │ │  [Messages Area]                  │   │ │
│ │                      │ │                                    │   │ │
│ │ ┌ All ┌ Sent ┌ Recv │ │  📥 From Library:                 │   │ │
│ │ └─────┼──────┼──────┘ │  ┌────────────────────────────┐   │   │ │
│ │       │      │         │  │ Please provide your       │   │   │ │
│ │ ┌─────┴──────┴──────┐  │  │ clearance details.        │   │   │ │
│ │ │                   │  │  │           2:45 PM         │   │   │ │
│ │ │ 📚 Library        │  │  └────────────────────────────┘   │   │ │
│ │ │ New message...1   │  │              ↩️ Reply              │   │ │
│ │ │ Just now          │  │                                    │   │ │
│ │ │                   │  │              📤 You:               │   │ │
│ │ ├───────────────────┤  │         ┌──────────────────────┐  │   │ │
│ │ │                   │  │         │ I'm ready. Here are  │  │   │ │
│ │ │ 💼 Finance        │  │         │ my documents.        │  │   │ │
│ │ │ Last payment...   │  │         │   2:46 PM      ✓✓    │  │   │ │
│ │ │ Yesterday, 3 PM   │  │         └──────────────────────┘  │   │ │
│ │ │                   │  │                                    │   │ │
│ │ ├───────────────────┤  │                                    │   │ │
│ │ │                   │  │ [Scroll more messages above]       │   │ │
│ │ │ 👥 HR            │  │                                    │   │ │
│ │ │ Regarding shift.. │  │                                    │   │ │
│ │ │ 2 days ago  [2]   │  │ ┌────────────────────────────────┐│   │ │
│ │ │                   │  │ │ 📎   ✏️     😊      📤          ││   │ │
│ │ │ [More...]         │  │ │                                  ││   │ │
│ │ │                   │  │ │ Type a message...                ││   │ │
│ │ │                   │  │ │                                  ││   │ │
│ │ │                   │  │ │ Press Ctrl+Enter to send         ││   │ │
│ │ │                   │  │ └────────────────────────────────┘│   │ │
│ │ └───────────────────┘  └────────────────────────────────────┘   │ │
│ │                                                                   │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Components & Their Styling

### 1. **Conversation Item (Active)**

```
┌─────────────────────────────────────────┐
│ 📚 Library                         [1]  │  ← Unread badge (red)
│ You: Please verify my records      2:45│  ← Last message preview + time
│ ⟵ Blue highlight (active)              │
└─────────────────────────────────────────┘
```

**Styling:**
- Background: Light blue gradient (#e0e7ff → #f0f9ff)
- Left border: 4px solid purple (#667eea)
- Avatar: 44px circular with gradient
- Text: Dark gray for title, lighter for preview
- Hover effect: Smooth transition

### 2. **Conversation Item (Inactive)**

```
┌─────────────────────────────────────────┐
│ 💼 Finance                              │  ← No badge
│ Department: Last payment processed  3PM │  ← From department
│ Gray background on hover                │
└─────────────────────────────────────────┘
```

**Styling:**
- Background: #fafbfc (light)
- Border: Light gray bottom separator
- Avatar: Same gradient purple
- Text: Gray until hover

### 3. **Message Bubble - Received (From Department)**

```
    ┌─────────────────────────────┐
    │ 📚 Your file is approved     │  ← Rounded corners (18px)
    │ Thank you for submitting     │
    │              2:45 PM          │  ← Light gray background
    └─────────────────────────────┘
    ↓ ↩️ Reply button below
```

**Styling:**
- Background: #f3f4f6 (light gray)
- Border radius: 18px rounded, 6px sharp bottom-right
- Max width: 70% of container
- Font: 14px, regular weight
- Alignment: Left side
- Shadow: 0 1px 3px rgba(0,0,0,0.08)

### 4. **Message Bubble - Sent (User)**

```
                    ┌──────────────────────────┐
                    │ I need to clarify one    │  ← Rounded corners
                    │ thing about the docs     │
                    │     2:46 PM      ✓✓     │  ← Purple gradient
                    └──────────────────────────┘
```

**Styling:**
- Background: Gradient (#667eea → #764ba2)
- Text color: White
- Border radius: 18px rounded, 6px sharp bottom-left
- Max width: 70% of container
- Alignment: Right side
- Read receipt: ✓ or ✓✓ (blue)

### 5. **Filter Buttons**

```
┌─────────────────────────────────────┐
│ [All]  [Sent]  [Received]  [Unread] │
│  ↑      ↑        ↑           ↑      │
│ Active  Bg:    Bg:           Bg:    │
│ Bg:    gray    gray          gray   │
│ purple Color: gray Color:gray       │
│ Color:white                         │
└─────────────────────────────────────┘
```

**Styling:**
- Active button: #667eea background, white text, rounded
- Inactive: #f3f4f6 background, #6b7280 text
- Padding: 6px 12px
- Border radius: 20px (pill shape)
- Hover: Darker gray
- Smooth transitions

### 6. **Message Input Box**

```
┌─────────────────────────────────────────────────────┐
│ 📎    [Type your message...]    😊    📤           │
│  ↑                                      ↑           │
│Attach                             Send button      │
└─────────────────────────────────────────────────────┘
Press Ctrl+Enter to send
```

**Styling:**
- Background: #f3f4f6 (light gray)
- Border radius: 24px (fully rounded)
- Focused: All white background with 2px purple border
- Icons: 18px, gray color, hover to purple
- Textarea: Flexible height (max 100px)
- Send button: 32px circular purple button
- Text field: 14px, inherits font, transparent background

### 7. **Chat Header**

```
┌──────────────────────────────────────────────────┐
│ 📚 Library                    [Call] [Info] [⋯]  │
│ 5 messages        ← Right side has white buttons │
└──────────────────────────────────────────────────┘
```

**Styling:**
- Background: White or light gradient
- Border bottom: 1px light gray
- Avatar: 40px circular
- Title: 15px bold, dark color
- Subtitle: 12px gray
- Action buttons: 36px circular, border, hover background
- Padding: 16px 20px

### 8. **Search Box**

```
┌────────────────────────────────┐
│ 🔍  Search conversations....   │
└────────────────────────────────┘
```

**Styling:**
- Background: White
- Icon: Gray
- Input: Transparent background, 14px font
- Placeholder: Gray text
- Border bottom: 1px light separator

### 9. **Unread Badge**

```
    [1]  ← Red background
    [3]  ← Red background
   [12]  ← Red background
```

**Styling:**
- Background: #ef4444 (red)
- Color: White
- Font: 11px bold
- Padding: 2px 6px
- Border radius: 10px
- Min width: 20px
- Text align: center

### 10. **Reply Input (Inline)**

```
┌─────────────────────────────────┐
│  [Message text field]           │
│  [Send]  [Cancel]               │  ← Action buttons below
└─────────────────────────────────┘
```

**Styling:**
- Background: #f3f4f6 (light gray)
- Padding: 12px
- Border radius: 8px
- Max width: 70%
- Send button: Green (#16a34a)
- Cancel button: Light gray
- Buttons: 6px radius, 12px padding

---

## 🌞 Color Reference

### Primary Colors
```
Primary Blue:     #003366 (Headers, sidebar)
Secondary Purple: #667eea (User messages, active)
Success Green:    #16a34a (Sent, actions)
Alert Red:        #ef4444 (Unread badges)
Info Cyan:        #0ea5e9 (Reply buttons)
```

### Neutral Colors
```
Dark Gray:        #1f2937 (Text)
Medium Gray:      #6b7280 (Secondary text)
Light Gray:       #f3f4f6 (Backgrounds)
Light Border:     #e5e7eb (Dividers)
Lighter Gray:     #f9fafb (Sidebar background)
```

### Backgrounds by Purpose
```
Selected Conv:    #e0e7ff → #f0f9ff (Light blue gradient)
Sent Message:     #667eea → #764ba2 (Purple gradient)
Received Msg:     #f3f4f6 (Light gray)
Remarks:          #fffbeb (Light yellow)
Input Box:        #f3f4f6 (Light gray)
```

---

## 📏 Common Spacing Values

```
xs:  4px   (padding/gap)
sm:  8px   (button gaps, borders)
md:  12px  (input padding)
lg:  16px  (card padding, header)
xl:  20px  (main padding, gaps)
2xl: 24px  (modal padding)
3xl: 30px  (page padding)
```

---

## 🎬 Animation Timings

```
Standard:  0.3s cubic-bezier(0.4, 0, 0.2, 1) (smooth)
Fast:      0.2s ease (quick feedback)
Slow:      1s ease (entrance animations)

Used for:
- Hover states: smooth 0.3s
- Loading spinner: spin 1s linear infinite
- Message fade in: fadeIn 0.3s
- Bounce animation: bounce 2s ease-in-out infinite
```

---

## 🔤 Typography Scale

```
H1: 26px, weight 700 (Page title)
H2: 24px, weight 700 (Modal titles)
H3: 18px, weight 700 (Section headers)
H4: 15px, weight 700 (Conversation/message titles)
Body: 14px, weight 500 (Main text)
Small: 13px, weight 600 (Labels, hints)
Tiny: 12px, weight 500 (Timestamps, subtitles)
Meta: 11px, weight 400 (Badges, icons)
```

---

## 🎨 Component Responsive Breakpoints

```
Desktop (1024px+):
  - Sidebar: 280px
  - Conversations panel: 340px
  - Chat panel: Flexible remaining width
  - Message max-width: 70%

Tablet (768px - 1024px):
  - Sidebar: Hidden or reduced
  - Conversations panel: 300px
  - Message max-width: 80%

Mobile (< 768px):
  - Layout: Stacked (vertical)
  - Full width panels
  - Message max-width: 90%
  - Sidebar: Completely hidden
```

---

## ✨ Special States

### Loading State
```
    ⟳ Loading...
    [Spinning circle animation]
```

### Empty State (No Messages)
```
    📭
    No messages yet
    Start a conversation with a department
    [Show department buttons]
```

### No Chat Selected
```
    💬
    Select a Conversation
    Choose a department from the list to start chatting
```

### Replying State
```
    Replying... ← Shows on message action button
    [Input box appears below message]
```

### Sending State
```
    Button shows: ⟳ (spinning)
    Disabled until request completes
    Then shows: ✓ or ✓✓
```

---

## 🖱️ Interactive Elements

### Clickable
```
- Conversation items → Select & open chat
- Filter buttons → Change view
- Reply button → Start reply
- Send button → Send message
- Search input → Type to filter
- Action buttons (Call, Info, ⋯) → Placeholder (future)
- Icon buttons (📎, 😊) → Placeholder (future)
```

### Hover Effects
```
- Conversations: Light background change
- Buttons: Color shift + slight transform
- Links: Color change + cursor pointer
- Input: Focus ring + color change
```

### Disabled States
```
- Send button when empty input
- Reply buttons while sending
- Disabled opacity: 0.5
- Cursor: not-allowed
```

---

## 📊 Typical Message Load Structure

```
Conversation 1: Library
├─ Message 1 (received)
├─ Message 2 (sent)
├─ Message 3 (received)
├─ Message 4 (sent)
└─ Message 5 (received) [UNREAD]

Conversation 2: Finance
├─ Message 1 (sent)
└─ Message 2 (received)

Conversation 3: HR
├─ Message 1 (received)
├─ Message 2 (sent)
└─ Message 3 (received) [UNREAD]
```

---

## 🎪 CSS Framework Used

**Framework:** CSS3 (No external framework like Bootstrap or Tailwind)

**Features:**
- Flexbox for layouts
- Grid for complex layouts
- CSS custom properties (variables)
- Animations and transitions
- Gradients and shadows
- Responsive media queries
- CSS scrollbar styling
- SVG icons via React Icons

---

## 📝 Implementation Notes

1. **No framework** - Pure CSS3 for lightweight, fast performance
2. **Mobile-first** - Responsive design considerations at all breakpoints
3. **Accessibility** - Focus states, semantic HTML, proper contrast
4. **Performance** - Smooth animations, optimized rendering
5. **Theming** - Easy to modify via CSS variables
6. **Dark mode ready** - Structure supports easy dark theme addition

---

**Last Updated:** March 13, 2026
**Version:** 2.0
**Status:** Complete & Documented
