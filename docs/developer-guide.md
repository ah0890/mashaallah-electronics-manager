# Developer Guide

## Goal

This project is a local-only electronics store management system for MS Electronics. It is designed for use on a single Windows desktop without internet access.

## Stack

- Electron
- SQLite
- Node.js
- HTML/CSS/JavaScript

## Key principles

- Local-first operation
- Transaction-safe database writes
- Simple and maintainable business rules
- Minimal dependencies
- Real-world shop workflows

## Database

The SQLite database is stored under the data folder. The schema is initialized in `src/db/database.js` and includes tables for products, customers, suppliers, sales, purchases, orders, expenses, and inventory movement records.

## Business rules

Core calculations and validation are centralized in `src/services/business.js` so they can be reused and tested independently.

## Testing

Run the test suite:

npm test

## Running the app

npm start

## Packaging

After installing Electron Builder, the app can be packaged for Windows using the electron-builder command.

## Extending the app

Follow the pattern below:

1. Add database methods in `src/db/database.js`
2. Add UI in the renderer files
3. Expose the function through `src/preload.js`
4. Add a focused test for the business rule

## Notes

The software is intentionally simple and robust rather than highly layered. This keeps it easy to maintain for a small shop environment while staying reliable offline.
