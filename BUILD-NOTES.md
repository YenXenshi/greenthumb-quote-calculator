# Build notes: GreenThumb

An instant lawn-care quote calculator with a line-by-line breakdown. No database, no login, no AI. Built in Google AI Studio's Build mode. This is project 4 of 5 in my [AI Studio build notes](https://github.com/YenXenshi/ai-studio-build-notes), where the full write-up lives.

This is an independent project, not made or endorsed by Google. Notes are from 2026-11-04 and 2026-11-07. The business name, phone number and email are made-up sample content.

## What I'm working on here
Keeping every price in one editable list, then checking the AI's math by hand.

## What the AI did that I did not ask for
It used $0.028 per sq ft instead of my example rate, added a third add-on and a Rate Sheet tab, and invented a phone number, an email and a stock photo.

## What I tested (by hand)
- 4,500 sq ft Mow and Edge: $126.00. Bag clippings: $22.50. Total $148.50.
- 500 sq ft: minimum prices applied. 3,000 sq ft: $84 + $15 = $99.
- Empty and negative inputs show friendly messages (in AI Studio).
- Fresh clone: typecheck and build pass, and the line prices matched at all three sizes.

## What I learned
The AI quietly changes specs, so compare what you asked for with what you got. Prices in one list are easy to change and easy to check.

## Security notes
All logic, including prices, runs in the browser, so treat the result as an estimate, not a binding quote.

## NOT tested
A real phone, editing the price list by hand, and what the Copy Quote button puts on the clipboard.

## Running it
`npm install --legacy-peer-deps`, then `npm run dev` (tested on Node 22; plain `npm install` fails with a dependency conflict).
