import { BlockfrostProvider, BrowserWallet, Transaction } from '@meshsdk/core';

/**
 * Generate SHA-256 hash of content
 */
export const generateContentHash = async (content) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Create blockchain transaction with metadata
 */
export const createBlockchainTransaction = async (
  walletApi,
  metadata
) => {
  try {
    console.log('Creating blockchain transaction with metadata:', metadata);
    
    // Initialize Blockfrost provider
    const blockfrostProvider = new BlockfrostProvider(
      import.meta.env.VITE_BLOCKFROST_PROJECT_ID
    );

    // Find which wallet is connected
    let connectedWalletName = null;
    if (window.cardano) {
      const wallets = Object.keys(window.cardano);
      for (const walletName of wallets) {
        try {
          const wallet = window.cardano[walletName];
          if (wallet && wallet.isEnabled && await wallet.isEnabled()) {
            connectedWalletName = walletName;
            break;
          }
        } catch (e) {
          // Continue checking other wallets
        }
      }
    }

    if (!connectedWalletName) {
      // Fallback: try common wallet names
      if (window.cardano?.lace?.isEnabled && await window.cardano.lace.isEnabled()) {
        connectedWalletName = 'lace';
      } else if (window.cardano?.nami?.isEnabled && await window.cardano.nami.isEnabled()) {
        connectedWalletName = 'nami';
      } else if (window.cardano?.eternl?.isEnabled && await window.cardano.eternl.isEnabled()) {
        connectedWalletName = 'eternl';
      } else {
        throw new Error('No connected wallet found');
      }
    }

    console.log('Using wallet:', connectedWalletName);
    
    // Create BrowserWallet instance - this wraps the CIP-30 wallet API
    const browserWallet = await BrowserWallet.enable(connectedWalletName);
    console.log('BrowserWallet instance created');
    
    // Get wallet address in bech32 format (addr1...)
    const walletAddresses = await browserWallet.getUsedAddresses();
    const walletAddress = walletAddresses[0]; // Get first address in bech32 format
    console.log('Wallet address (bech32):', walletAddress);
    
    // Build transaction using Mesh Transaction builder with BrowserWallet as initiator
    const tx = new Transaction({ initiator: browserWallet });
    
    // Add a minimal output to own address (required for valid Cardano transaction)
    // The funds will be returned to wallet minus the transaction fee
    console.log('Adding minimal output to own address...');
    tx.sendLovelace(
      walletAddress, // Use bech32 address, not hex
      '1000000' // 1 ADA in lovelace
    );
    
    // Create metadata for the transaction
    // Note: Cardano metadata has a 64-byte limit per string value
    // Split long addresses into chunks if needed
    console.log('Creating metadata...');
    
    const ownerAddress = metadata.owner;
    let ownerMetadata;
    
    // If owner address is longer than 64 characters, split it into chunks
    if (ownerAddress && ownerAddress.length > 64) {
      const chunks = [];
      for (let i = 0; i < ownerAddress.length; i += 64) {
        chunks.push(ownerAddress.substring(i, i + 64));
      }
      ownerMetadata = chunks; // Store as array
    } else {
      ownerMetadata = ownerAddress; // Store as string
    }
    
    const txMetadata = {
      action: metadata.action,
      noteId: metadata.noteId ? metadata.noteId.toString() : 'new',
      contentHash: metadata.contentHash,
      owner: ownerMetadata,
      timestamp: metadata.timestamp.toString(),
    };
    
    console.log('Metadata created:', txMetadata);
    
    // Add metadata to transaction (label 674)
    tx.setMetadata(674, txMetadata);
    
    // Build, sign, and submit the transaction
    // With Mesh SDK's BrowserWallet, this is all handled in one step
    console.log('Building, signing, and submitting transaction...');
    const txHash = await browserWallet.signTx(
      await tx.build(),
      true // partial sign = true
    );
    
    // Submit the signed transaction
    const submittedTxHash = await browserWallet.submitTx(txHash);
    console.log('Transaction submitted. Hash:', submittedTxHash);

    return submittedTxHash;
  } catch (error) {
    console.error('Error creating blockchain transaction:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
};

/**
 * Submit a note CREATE action to blockchain
 */
export const submitCreateNoteToBlockchain = async (
  walletApi,
  walletAddress,
  noteContent,
  noteTitle,
  noteId = null // Optional: real note ID from database
) => {
  try {
    const contentHash = await generateContentHash(noteContent);
    
    const metadata = {
      action: 'CREATE',
      noteId: noteId, // Use the real note ID if provided
      contentHash,
      owner: walletAddress,
      timestamp: Date.now(),
    };

    const txHash = await createBlockchainTransaction(walletApi, metadata);
    
    return {
      txHash,
      contentHash,
    };
  } catch (error) {
    console.error('Error submitting CREATE to blockchain:', error);
    console.error('Error message:', error?.message);
    console.error('Error details:', error);
    throw error;
  }
};

/**
 * Submit a note UPDATE action to blockchain
 */
export const submitUpdateNoteToBlockchain = async (
  walletApi,
  walletAddress,
  noteId,
  noteContent
) => {
  try {
    const contentHash = await generateContentHash(noteContent);
    
    const metadata = {
      action: 'UPDATE',
      noteId,
      contentHash,
      owner: walletAddress,
      timestamp: Date.now(),
    };

    const txHash = await createBlockchainTransaction(walletApi, metadata);
    
    return {
      txHash,
      contentHash,
    };
  } catch (error) {
    console.error('Error submitting UPDATE to blockchain:', error);
    throw error;
  }
};

/**
 * Submit a note DELETE action to blockchain
 */
export const submitDeleteNoteToBlockchain = async (
  walletApi,
  walletAddress,
  noteId,
  noteContent
) => {
  try {
    const contentHash = await generateContentHash(noteContent);
    
    const metadata = {
      action: 'DELETE',
      noteId,
      contentHash,
      owner: walletAddress,
      timestamp: Date.now(),
    };

    const txHash = await createBlockchainTransaction(walletApi, metadata);
    
    return {
      txHash,
      contentHash,
    };
  } catch (error) {
    console.error('Error submitting DELETE to blockchain:', error);
    throw error;
  }
};

/**
 * Verify if content matches stored hash
 */
export const verifyContentHash = async (content, storedHash) => {
  const computedHash = await generateContentHash(content);
  return computedHash === storedHash;
};

