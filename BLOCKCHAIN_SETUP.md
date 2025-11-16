# 🚀 Blockchain Integration Setup Guide

## Prerequisites

1. **Cardano Wallet Extension** (Required)
   - Install [Lace Wallet](https://www.lace.io/) or (https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk) (Recommended)
   - Or any CIP-30 compatible wallet (Eternl, Nami, etc.)
   - Switch wallet network to **Cardano Preview Testnet**

2. **Blockfrost API Key** (Required)
   - Sign up at [Blockfrost.io](https://blockfrost.io/)
   - Create a new project for **Cardano Preview Testnet**
   - Copy your Project ID

3. **Test ADA** (Required)
   - Get free test ADA from [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)
   - You need at least 5-10 test ADA for transactions

## Environment Configuration

### Frontend Setup

1. Create a `.env` file in the `frontend/` directory:

```bash
cd frontend
```

2. Add the following configuration:

```env
# Blockfrost Configuration
VITE_BLOCKFROST_PROJECT_ID=your_blockfrost_project_id_here

# API Configuration (optional, defaults to deployed backend)
VITE_API_URL=http://localhost:8080
```

3. Replace `your_blockfrost_project_id_here` with your actual Blockfrost Project ID

### Backend Setup

The backend is already configured to handle blockchain fields. No additional setup needed.

## Installation

### Backend

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## How It Works

### 1. Connect Wallet

- Open the application in your browser
- Click "Connect Wallet" button in the top banner
- Select your wallet (Lace, Eternl, Nami, etc.)
- Approve the connection in your wallet extension

### 2. Create a Note

- Click "Add Note" button
- Fill in title and content
- Click "Save"
- **Wallet popup will appear** - Confirm the transaction
- Wait for blockchain confirmation
- Note is saved to database with blockchain proof

### 3. Update a Note

- Click edit icon on any note
- Modify title or content
- Click "Update"
- **Wallet popup will appear** - Confirm the transaction
- Wait for blockchain confirmation
- Update is recorded on blockchain

### 4. Delete a Note

- Click delete icon on any note
- Confirm deletion
- **Wallet popup will appear** - Confirm the transaction
- Wait for blockchain confirmation
- Deletion is recorded on blockchain

### 5. View Blockchain Proof

- Each note card shows "On-chain" badge if recorded on blockchain
- Click "View TX" link to see the transaction on Cardano Explorer
- Transaction contains metadata with:
  - Action type (CREATE/UPDATE/DELETE)
  - Note ID
  - Content hash (SHA-256)
  - Owner wallet address
  - Timestamp

## What's Stored On-Chain?

### Blockchain Transaction Metadata

For each operation, the following metadata is stored on Cardano blockchain:

```json
{
  "674": {
    "msg": ["CREATE" | "UPDATE" | "DELETE"],
    "noteId": "123",
    "contentHash": "a39f92bf12...",
    "owner": "addr1...",
    "timestamp": "1731891234567"
  }
}
```

### Database Fields

The following fields are stored in the PostgreSQL/MySQL database:

| Field | Type | Description |
|-------|------|-------------|
| id | BIGINT | Auto-generated note ID |
| title | VARCHAR | Note title |
| content | TEXT | Full note content |
| owner_wallet | VARCHAR | Cardano wallet address |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| last_tx_hash | VARCHAR | Latest blockchain transaction hash |
| content_hash | VARCHAR | SHA-256 hash of content |

## Security & Privacy

✅ **What's Private:**
- Note title and content are NOT stored on blockchain
- Only stored in your private database
- Content hash is stored on-chain for verification

✅ **What's Public:**
- Transaction hash (on Cardano blockchain)
- Content hash (SHA-256, cannot be reversed)
- Wallet address
- Timestamp
- Action type

✅ **Tamper Detection:**
- If database content is modified, the hash won't match blockchain
- Provides cryptographic proof of data integrity

## Troubleshooting

### "No Cardano wallets detected"
- Install Lace or another CIP-30 compatible wallet
- Refresh the page after installation

### "Failed to connect wallet"
- Make sure wallet is unlocked
- Make sure wallet is on Preview Testnet
- Try refreshing the page

### "Transaction failed"
- Check you have sufficient test ADA (at least 2-3 ADA)
- Check wallet is on Preview Testnet
- Check Blockfrost API key is correct

### "Network error"
- Make sure backend is running on port 8080
- Check VITE_API_URL in `.env` is correct
- Check CORS settings in backend

### Transaction is pending forever
- Preview testnet can be slow
- Wait 2-3 minutes
- Check transaction on [Cardano Preview Explorer](https://preview.cardanoscan.io/)

## Architecture

```
┌─────────────┐
│   React     │  1. User creates/updates/deletes note
│  Frontend   │  2. Generate SHA-256 hash
└──────┬──────┘  3. Prepare metadata
       │
       ↓
┌─────────────┐
│ Lace Wallet │  4. User confirms transaction
│  (Browser)  │  5. Wallet signs transaction
└──────┬──────┘  6. Returns signed TX + hash
       │
       ↓
┌─────────────┐
│ Blockfrost  │  7. Submit signed transaction
│     API     │  8. Returns TX hash
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Cardano   │  9. Transaction recorded on-chain
│ Blockchain  │  10. Immutable proof stored
└─────────────┘
       │
       │
┌──────↓──────┐
│   React     │  11. Send note + TX hash to backend
│  Frontend   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Spring Boot │  12. Save note to database
│   Backend   │  13. Store TX hash + content hash
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   MySQL/    │  14. Note stored with blockchain proof
│ PostgreSQL  │
└─────────────┘
```

## Features

✅ **Implemented:**
- Wallet connection (CIP-30)
- CREATE note with blockchain proof
- UPDATE note with blockchain proof
- DELETE note with blockchain proof
- SHA-256 content hashing
- Transaction metadata
- Blockchain verification links
- Wallet status indicator
- Loading states
- Error handling

## Testing

1. **Connect Wallet:**
   - Test with different wallets (Lace, Eternl, Nami)
   - Test disconnect/reconnect

2. **Create Note:**
   - Create note without wallet → Should show error
   - Create note with wallet → Should show wallet popup
   - Check transaction on Cardano Explorer

3. **Update Note:**
   - Update note → Should create new transaction
   - Check content hash changes

4. **Delete Note:**
   - Delete note → Should create DELETE transaction
   - Note removed from database
   - DELETE action recorded on blockchain

5. **View Blockchain Proof:**
   - Click "View TX" link on note card
   - Verify metadata on Cardano Explorer

## Additional Resources

- [Cardano Preview Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)
- [Blockfrost Documentation](https://docs.blockfrost.io/)
- [Lace Wallet](https://www.lace.io/)
- [Cardano Preview Explorer](https://preview.cardanoscan.io/)
- [CIP-30 Specification](https://cips.cardano.org/cips/cip30/)
- [Mesh SDK Documentation](https://meshjs.dev/)

## Support

For issues or questions:
1. Check the browser console for error messages
2. Check the backend logs
3. Verify wallet is on Preview Testnet
4. Verify Blockfrost API key is valid
5. Check you have sufficient test ADA


