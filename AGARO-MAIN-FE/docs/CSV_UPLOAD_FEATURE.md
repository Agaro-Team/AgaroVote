# CSV Upload Feature Documentation

## Overview

Bulk upload functionality for adding multiple wallet addresses to voting pools via CSV file upload.

## Features Implemented

### 1. **CSV Validation & Parsing** (`app/lib/csv-utils.ts`)

#### Utilities:
- `isValidEthereumAddress(address: string)`: Validates Ethereum address format (0x + 40 hex chars)
- `parseAddressesCSV(file, maxRows?, maxFileSize?)`: Parses and validates CSV files
- `downloadAddressTemplate()`: Generates and downloads CSV template
- `removeDuplicateAddresses(addresses)`: Removes duplicate addresses

#### Validation Rules:
- ✅ File size limit: **1MB**
- ✅ Row limit: **10,000 addresses**
- ✅ Required column: `address`
- ✅ Ethereum address format validation
- ✅ Duplicate detection (within CSV & with existing form data)
- ✅ Empty row handling

### 2. **CSV Upload Modal** (`app/components/voting-pools/csv-upload-modal.tsx`)

#### Features:
- 📥 **Drag & Drop** file upload using `react-dropzone`
- 📊 **Real-time validation** with detailed error reporting
- 📋 **Preview table** showing valid/invalid addresses
- 📈 **Statistics dashboard**:
  - Valid addresses count
  - Invalid addresses count
  - Duplicates removed count
- 📄 **Template download** with sample addresses
- ⚠️ **Error handling** with detailed messages
- 🎨 **Smooth scrolling** using shadcn ScrollArea component

#### Modal Sections:
1. **Header**: Title & description
2. **Template Download**: One-click template download
3. **Dropzone**: Drag & drop or click to upload
4. **Validation Results** (with ScrollArea for smooth scrolling):
   - Statistics cards (valid/invalid)
   - Duplicate warning banner
   - Invalid addresses table with line numbers (scrollable)
   - Valid addresses preview (first 10, scrollable)
5. **Footer**: Cancel & Upload buttons

### 3. **Integration** (`app/components/voting-pools/allowed-addresses-field.tsx`)

#### Changes:
- Added **"Upload CSV"** button next to **"Add Address"** button
- Integrated modal state management
- Automatic append of validated addresses to form field
- Duplicate prevention with existing form data

## Usage

### For Users:

1. **Navigate** to the "Create Voting Pool" form
2. **Scroll** to the "Allowed Addresses" field (for private pools)
3. **Click** "Upload CSV" button
4. **Download** the template to see the required format
5. **Prepare** your CSV file:
   ```csv
   address
   0x1234567890123456789012345678901234567890
   0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
   ```
6. **Upload** via drag & drop or file picker
7. **Review** validation results and preview
8. **Click** "Upload" to add addresses to the form

### CSV Template Format:

```csv
address
0x1234567890123456789012345678901234567890
0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
0x0000000000000000000000000000000000000000
```

## Dependencies Added

```json
{
  "dependencies": {
    "papaparse": "^5.5.3",
    "react-dropzone": "^14.3.8"
  },
  "devDependencies": {
    "@types/papaparse": "^5.3.16"
  }
}
```

## Error Handling

### File-level Errors:
- ❌ File size exceeds 1MB
- ❌ Invalid file type (not CSV)
- ❌ Missing 'address' column
- ❌ Exceeds 10,000 rows

### Row-level Errors:
- ⚠️ Invalid Ethereum address format
- ⚠️ Empty address field
- ⚠️ Duplicate addresses (automatically removed)

## User Experience Flow

```
[Upload CSV Button] → [Modal Opens] → [Download Template (Optional)]
                                    ↓
                              [Upload CSV File]
                                    ↓
                              [Validation & Preview]
                                    ↓
                              [Review Results]
                                    ↓
                   [Upload] → [Addresses Added to Form]
```

## Success Feedback

After successful upload, users see:
- ✅ "X valid addresses added"
- ⚠️ "X duplicates removed (if any)"
- ❌ "X invalid addresses skipped (if any)"

## Technical Notes

- Uses **TanStack Form** for form state management
- Addresses are **appended** to existing form data (not replaced)
- Duplicate detection is **case-insensitive**
- Modal uses **shadcn ScrollArea** for smooth, native-like scrolling experience
- Modal is **responsive** with max height constraints (60vh for main content)
- **Validation happens client-side** before form submission
- Preview shows first 10 valid addresses and all invalid ones (max 50 shown)
- Tables have fixed height (48 = 192px) with scrollable content

## Future Enhancements (Optional)

- [ ] Support for additional columns (labels, tags)
- [ ] ENS domain resolution
- [ ] Export current addresses to CSV
- [ ] Batch validation via API
- [ ] Address format conversion utilities

---

**Created**: October 12, 2025
**Version**: 1.0.0

