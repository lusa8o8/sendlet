# Sendlet

A lean SaaS for publishing email-gated lead magnet opt-in pages.

## Run & Operate

- `pnpm --filter @workspace/sendlet run dev` — run the frontend (Vite, reads `PORT`)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, wouter routing, shadcn/ui, framer-motion
- Fonts: DM Sans (Google Fonts)
- Brand: teal `#0F766E`
- Data: mock data in `artifacts/sendlet/src/data/mock.ts` with localStorage persistence

## Where things live

- `artifacts/sendlet/src/data/mock.ts` — LeadMagnet type, seed data, saveMagnet/updateMagnet/removeMagnet
- `artifacts/sendlet/src/pages/template-picker.tsx` — entire builder: FloatingBar, DraggableTextBlock, all 4 preview components, PickerPanel, TemplatePicker page
- `artifacts/sendlet/src/pages/public-page.tsx` — public opt-in page renderer (4 layouts)
- `artifacts/sendlet/src/pages/dashboard.tsx` — stat cards + lead magnet table
- `artifacts/sendlet/src/pages/lead-magnet-detail.tsx` — detail page with edit button
- `artifacts/sendlet/src/App.tsx` — wouter routes

## Architecture decisions

- No backend: all data is stored in a mutable `leadMagnets` array (seeded) and persisted to localStorage.
- Mock user: Sarah Chen (hardcoded throughout).
- 4 layouts: `simple`, `split`, `stacked`, `fullimage`. Each has a static preview and an interactive (draggable) edit mode.
- `TextEl` tracks x/y/w/size/color/backdrop per block for canvas-style positioning.
- `hiddenBlocks: TextElKey[]` on Form + LeadMagnet controls which text blocks are hidden in both the editor and the public page.
- Images are compressed via `compressImage()` (canvas resize → JPEG 0.82) before saving to localStorage.

## Product

- Dashboard showing lead magnet stats and a table of existing pages.
- Layout picker (Simple, Visual Split, Stacked, Full Image).
- Full-canvas editor with draggable/resizable text blocks, color picker, backdrop styles, inline text editing.
- Floating editor bar (bottom pill or side panel) with Image, Content, Design, Settings popovers.
- Text blocks can be hidden individually; hidden blocks shown in Content → "Hidden blocks" section with a restore button.
- Published public opt-in pages at `/p/:slug` (4 layout renderers).

## User preferences

- No backend/DB for the Sendlet artifact — localStorage only.
- All 4 layouts must support the same interactive editing features.

## Gotchas

- `setForm` in FloatingBar expects `(f: Form) => void` (direct object), not a setter function.
- The `barPosition` state lives in TemplatePicker (not FloatingBar) so the layout can flex between side/bottom modes.
- When `barPosition === "side"`, the edit area renders as a flex row; FloatingBar returns a vertical div (not absolutely positioned).
- `bulletsEnabled` controls bullet visibility separately from `hiddenBlocks` (for backward compat with public page rendering).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
