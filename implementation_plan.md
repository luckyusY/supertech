# Implementation Plan: Dashboard Optimization & Product Approval Workflow

## Goal Description
The objective is to fix product approval workflows, clarify product visibility on the website, and optimize the admin and vendor dashboards for mobile devices. 

Currently, the admin dashboard lacks the UI to approve or reject vendor product submissions, and built-in "seed" products appear on the website by default (which might be misconstrued as "unapproved" products appearing). Additionally, the dashboard tables need responsive wrappers to prevent horizontal overflow on mobile devices.

## Open Questions
- **Seed Products:** By default, the application comes with "seed" products (built-in dummy data) that appear on the website hero and catalog. You can disable these from the Admin Products page. Would you prefer if we hid all seed products by default, or is it sufficient that you can disable them manually?
- **Unapproved Products Not Appearing:** Vendor submissions should currently appear on the `Admin -> Products` page as "Pending". If you are not seeing them at all, please verify if MongoDB is properly connected (`MONGODB_URI` in your environment variables), as submissions require a database.

## Proposed Changes

### Dashboard Mobile Optimization

#### [MODIFY] `src/components/ui/data-table.tsx`
- Wrap the main `table` element in a `div` with `overflow-x-auto` to allow horizontal scrolling on small screens.
- Add `whitespace-nowrap` to table cells to prevent awkward text wrapping on mobile devices.

#### [MODIFY] `src/components/dashboard-scroll-table.tsx`
- Ensure the scroll container has appropriate padding and scroll snapping for mobile devices.

#### [MODIFY] `src/components/admin-page-header.tsx`
- Adjust flexbox layout to stack title and actions vertically on mobile screens (`flex-col sm:flex-row`).

### Product Approval Workflow

#### [MODIFY] `src/app/dashboard/admin/products/actions.ts`
- Add `approveProductAction(id: string)` and `rejectProductAction(id: string)` server actions.
- These actions will call the existing `updateProductSubmissionStatus` function and revalidate the paths.

#### [MODIFY] `src/components/admin-products-table.tsx`
- Add "Approve" (CheckIcon) and "Reject" (XIcon) buttons to the action column for rows with `kind === "submission"` and `status === "pending_review"`.
- Hook up these buttons to the new server actions.
- Update the status badges to explicitly show "Pending Approval" to make it clearer for admins.

#### [MODIFY] `src/lib/public-marketplace.ts`
- Ensure `getPublicFeaturedProducts` and other public fetching logic strictly relies on `status: "approved"` for vendor submissions (this is already the case, but we will add explicit comments and verify seed product merging logic).

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
1. Open the vendor dashboard on a mobile device to verify tables are scrollable and layout is responsive.
2. Submit a new product as a vendor.
3. Verify the product appears in the Admin Products dashboard as "Pending".
4. Click "Approve" on the admin dashboard.
5. Verify the product's status changes to "Approved" and it now appears on the public website catalog and hero sections.
