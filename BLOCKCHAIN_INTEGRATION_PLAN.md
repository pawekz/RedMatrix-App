📝 Notes App – Blockchain Integration Documentation
📌 Overview

This document explains how the Notes App integrates blockchain for all Create, Update, Delete (CUD) operations using:

React JS (frontend)

Spring Boot (backend)

Blockfrost (Cardano API)

Lace Wallet Extension

Cardano Preview Testnet

Blockchain is used as a tamper-proof audit trail, while the actual note content is stored in the database.

🗄 Database Design
🧱 Table: notes
Column Name	Type	Description
id	INT (PK)	Auto-generated note ID
title	VARCHAR	Title of the note
content	TEXT	Full note content
owner_wallet	VARCHAR	User’s Cardano wallet address
created_at	TIMESTAMP	When the note was created
updated_at	TIMESTAMP	When the note was last updated
last_tx_hash	VARCHAR	The blockchain transaction hash for the latest action
content_hash	VARCHAR	SHA-256 hash of the note content (for on-chain integrity check)
✔ Why store content_hash?

To verify that DB content matches the on-chain metadata. If DB is tampered, the hash won’t match blockchain record.

🔗 Blockchain Data Stored (NOT full note content)

For each blockchain transaction (C/U/D), you send metadata:

{
  "noteId": 12,
  "action": "CREATE",
  "contentHash": "a39f92bf12...",
  "owner": "addr1xyz...",
  "timestamp": 173189
}


No private data is stored on-chain. Only proof.

⚙️ Workflow (Step-by-Step)
1️⃣ User interacts with React frontend

User types a note or edits/deletes one.

React generates contentHash = SHA256(content).

2️⃣ React prepares blockchain metadata

Example:

{
  "noteId": 12,
  "action": "UPDATE",
  "contentHash": "...",
  "owner": "addr1xyz..."
}

3️⃣ React asks Lace Wallet to sign + submit transaction

Using CIP-30 wallet API

Frontend uses Blockfrost only for submit endpoint

Backend does NOT sign (wallet must sign)

✔ Correct rule:

All blockchain signing happens on the frontend.
Backend should never touch private keys.

4️⃣ Wallet popup appears

User confirms:

Transaction fee

Metadata being written

Lace wallet signs and returns:

Signed transaction bytes

Transaction hash

5️⃣ Frontend sends signed transaction to Blockfrost

Example:

POST /tx/submit


Blockfrost returns:

Final TX hash (same as wallet hash)

6️⃣ React sends the C/U/D request to Spring Boot

Payload example:

{
  "id": 12,
  "title": "My updated note",
  "content": "Buy milk",
  "contentHash": "...",
  "txHash": "8eab...a91"
}

7️⃣ Spring Boot saves data to MySQL

Backend stores:

Note title

Note content

Owner wallet

contentHash

txHash

timestamps

Backend does NOT talk to Blockfrost for signing or wallet actions.

8️⃣ Verification (Optional for presentation)

Backend or frontend can verify:

Compare DB content_hash

With blockchain contentHash in metadata

If mismatch → content is altered → tampering detected.

🔥 Architecture Summary
React → Lace Wallet → Blockfrost → Blockchain
    ↓                    ↑
    └────→ Spring Boot DB ────┘

Frontend responsibilities:

Generate content hash

Prepare metadata

Request wallet signing

Submit signed TX to Blockfrost

Send TX hash + note content to backend

Backend responsibilities:

Store note

Store contentHash

Store txHash

CRUD business logic
