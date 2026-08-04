# Developer Log: Order Source Tracking & POS Sync
**Date:** 2026-08-04

## Objective
Implement Order Source tracking (Facebook, Website, POS/Manual, etc.) and smartly sync the Order Status based on the source (e.g., Direct Sales automatically complete).

## Changes Made

1. **Global Types (`src/types/backend.ts`)**
   - Added `SALE_SOURCES` enum (`WEBSITE`, `FACEBOOK`, `WHATSAPP`, `DIRECT_MANUAL`, `OTHER`).
   - Exported `SaleSource` type and `DEFAULT_SALE_SOURCE`.

2. **Database Model (`src/models/Sale.ts`)**
   - Updated `ISale` interface to include `source: SaleSource`.
   - Updated Mongoose `saleSchema` to include the `source` field.

3. **Backend API (`src/app/api/v1/sales/route.ts`)**
   - Modified `POST` handler to receive `source` and `status` from payload.
   - Used the provided `status` and `source` when calling `Sale.create()` instead of hardcoding `PENDING`.
   - Updated `statusHistory` array with the provided `status`.

4. **Frontend UI: Add Sale (`src/components/dashboard/pages/super-admin/sales/AddSaleClient.tsx`)**
   - Added state for `source` and `status`.
   - Included UI Dropdowns for `Order Source` and `Order Status`.
   - Added `useEffect` hook for Smart Sync: if `source === "DIRECT_MANUAL"`, `status` automatically changes to `COMPLETED`.
   - Sent `source` and `status` in the API payload during checkout.

5. **Frontend UI: Sales List (`src/components/dashboard/pages/super-admin/sales/SalesClient.tsx`)**
   - Added `Globe, Facebook, Smartphone, Store` icons from `lucide-react`.
   - Implemented `getSourceDetails()` helper to return specific icons and badge colors based on source.
   - Added `Source` column in the data table between `Status` and `Actions`.
   - Handled gracefully for old orders with empty or undefined source.

6. **Frontend UI: Sale Details (`src/components/dashboard/pages/super-admin/sales/SaleDetailsClient.tsx`)**
   - Added `getSourceDetails()` helper and imported corresponding lucide icons.
   - Displayed a stylish source badge right next to the Order ID and Status in the invoice header.

## Future Considerations
- Generate analytics based on `source` in the Dashboard Overview.
- Ensure automated webhook integrations (if any) pass the correct `source` string (e.g., WooCommerce = `WEBSITE`).
