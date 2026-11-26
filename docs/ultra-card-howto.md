# Habib Home (Ultra): how to edit

Dashboard: sidebar **Habib Home (Ultra)** (`/habib-home-uc`), admin only until cutover. Tabs: Home, Lights, Media. Theme: Liquid Glass (as shipped). Layout: FreeSpace.

## Move, resize, add, remove (Mac or iPad is easiest)
1. Open the dashboard, pencil (top right) → **Edit dashboard**.
2. **Move:** drag a card. **Resize:** drag an edge or corner. Orange lines show spacing; **Snap to grid** is in the toolbar.
3. **Add:** the round **+** button (or Add card) → pick **Ultra Card** or any HA card.
4. **Remove:** right-click (or ⋮) on a card → Delete. **Undo:** Cmd+Z while still in edit mode.
5. **Change what is inside a card:** double-click it. Ultra Cards open the Layout Builder: drag modules, and each module has General, Actions, Logic and Design tabs.
6. **New tab:** in edit mode, **+** next to the tabs → name and icon → **Layout: FreeSpace (Ultra Card)** → save.
7. Click **Done**. Changes save to HA when you let go of a card.

## Screens
- The **Desktop** layout is the master. Laptop and Tablet show it scaled down; the Phone stacks the cards in reading order (top to bottom, left to right). Nothing to maintain for the phone unless you want a custom phone layout (toolbar → Phone → Custom).
- If a card shows a **Cut off** badge, select it and turn on **Auto height**.

## Rules kept from before
- Front door and Garage tiles open HA's own dialog on every tap. Do not add Ultra lock or garage buttons with a direct action (D48, D60).
- Do not turn on Pro or sign in (no account, no cloud).
- Updates to Ultra Card: tell Claude first (backup and git export before updating).
- After a big editing session, tell Claude "export the Ultra dashboard" so the layout is saved to git.
