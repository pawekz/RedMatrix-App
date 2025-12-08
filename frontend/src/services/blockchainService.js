import { BrowserWallet, Transaction } from '@meshsdk/core';

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
 * Format content for Cardano metadata
 * Cardano metadata strings cannot exceed 64 bytes
 * This function chunks long content into 64-character pieces
 */
export const formatContent = (content) => {
  // Case 1: Short string (fits in one chunk)
  if (content.length <= 64) {
    return content;
  }

  // Case 2: Long string (needs splitting)
  // Regex splits the string every 64 characters
  const chunks = content.match(/.{1,64}/g) || [];
  return chunks; // Return as array for Mesh SDK metadata
};

/**
 * Create blockchain transaction with metadata
 */
export const createBlockchainTransaction = async (
  walletApi,
  metadata,
  targetAddress,
  lovelaceAmount
) => {
  try {
    console.log('Creating blockchain transaction with metadata:', metadata);
    console.log('Target address:', targetAddress);
    console.log('Lovelace amount:', lovelaceAmount);
    
    // Validate required parameters
    if (!metadata) {
      throw new Error('Metadata is required');
    }
    
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
    
    // For delete operations, target address and amount can be optional
    // If not provided, we'll create a minimal transaction to self
    if (!targetAddress || !lovelaceAmount) {
      console.log('Target address or amount not provided, creating minimal transaction to self');
      
      // Use BrowserWallet to get proper bech32 address
      const { BrowserWallet } = await import('@meshsdk/core');
      const tempBrowserWallet = await BrowserWallet.enable(connectedWalletName);
      const usedAddresses = await tempBrowserWallet.getUsedAddresses();
      targetAddress = targetAddress || usedAddresses[0]; // Use bech32 address
      lovelaceAmount = lovelaceAmount || '2000000'; // Default 2 ADA for delete (to meet minimum)
    }
    
    if (!targetAddress) {
      throw new Error('Target address is required');
    }
    if (!lovelaceAmount || lovelaceAmount <= 0) {
      throw new Error('Valid lovelace amount is required');
    }
    
    // Create BrowserWallet instance - this wraps the CIP-30 wallet API
    const browserWallet = await BrowserWallet.enable(connectedWalletName);
    console.log('BrowserWallet instance created');
    
    // Get wallet address in bech32 format (addr1...)
    const walletAddresses = await browserWallet.getUsedAddresses();
    const walletAddressBech32 = walletAddresses[0]; // Get first address in bech32 format
    console.log('Wallet address (bech32):', walletAddressBech32);
    
    // Build transaction using Mesh Transaction builder with BrowserWallet as initiator
    const tx = new Transaction({ initiator: browserWallet });
    
    // Send payment to target address
    console.log('Sending payment to target address:', targetAddress);
    tx.sendLovelace(
      targetAddress,
      lovelaceAmount.toString()
    );
    
    // Set your own address as the change address
    // Any remaining funds after fees and payment will return here
    // Skip if target is the same as change address (delete operations)
    if (targetAddress !== walletAddressBech32) {
      console.log('Setting change address to own wallet:', walletAddressBech32);
      tx.sendLovelace(
        walletAddressBech32,
        '0' // Mesh SDK will automatically calculate and send change
      );
    } else {
      console.log('Target is same as change address, skipping duplicate output');
    }
    
    // Create metadata for the transaction
    // Note: Cardano metadata has a 64-byte limit per string value
    // Use bech32 address format (addr1...) instead of hex for better readability
    console.log('Creating metadata...');
    
    const ownerAddress = walletAddressBech32; // Use bech32 format, not the hex from metadata.owner
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
      action: metadata.action || 'UNKNOWN',
      noteId: metadata.noteId ? metadata.noteId.toString() : 'new',
      content: metadata.content ? formatContent(metadata.content) : '',
      contentHash: metadata.contentHash || '',
      owner: ownerMetadata || '',
      timestamp: metadata.timestamp ? metadata.timestamp.toString() : Date.now().toString(),
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
  targetAddress,
  lovelaceAmount,
  noteId = null // Optional: real note ID from database
) => {
  try {
    const contentHash = await generateContentHash(noteContent);
    
    const metadata = {
      action: 'CREATE',
      noteId: noteId, // Use the real note ID if provided
      content: noteContent,
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
  noteContent,
  targetAddress,
  lovelaceAmount
) => {
  try {
    const contentHash = await generateContentHash(noteContent);
    
    const metadata = {
      action: 'UPDATE',
      noteId,
      content: noteContent,
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
  noteContent,
  targetAddress = null, // Optional
  lovelaceAmount = null // Optional
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

