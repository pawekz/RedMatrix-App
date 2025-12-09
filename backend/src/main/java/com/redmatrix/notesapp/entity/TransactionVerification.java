package com.redmatrix.notesapp.entity;

import java.time.OffsetDateTime;
import java.time.Instant;
import java.time.ZoneOffset;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Index;

/**
 * Entity to track blockchain transaction verification status.
 * Each record represents a verification attempt for a note's transaction.
 */
@Entity
@Table(name = "transaction_verifications", indexes = {
    @Index(name = "idx_tx_hash", columnList = "tx_hash"),
    @Index(name = "idx_note_id", columnList = "note_id"),
    @Index(name = "idx_status", columnList = "status")
})
public class TransactionVerification {

    public enum VerificationStatus {
        PENDING,      // Waiting to be verified
        PROCESSING,   // Currently being verified
        VERIFIED,     // Successfully verified on blockchain
        FAILED,       // Verification failed (tx not found or mismatch)
        EXPIRED       // Too many retries, marked as expired
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "note_id", nullable = false)
    private Long noteId;

    @Column(name = "tx_hash", nullable = false)
    private String txHash;

    @Column(name = "content_hash")
    private String contentHash;

    @Column(name = "owner_wallet")
    private String ownerWallet;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VerificationStatus status = VerificationStatus.PENDING;

    @Column(name = "retry_count")
    private Integer retryCount = 0;

    @Column(name = "max_retries")
    private Integer maxRetries = 10;

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;

    @Column(name = "verified_at")
    private OffsetDateTime verifiedAt;

    @Column(name = "blockchain_content_hash")
    private String blockchainContentHash;

    @Column(name = "blockchain_action")
    private String blockchainAction;

    @Column(name = "hash_match")
    private Boolean hashMatch;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Constructors
    public TransactionVerification() {}

    public TransactionVerification(Long noteId, String txHash, String contentHash, String ownerWallet) {
        this.noteId = noteId;
        this.txHash = txHash;
        this.contentHash = contentHash;
        this.ownerWallet = ownerWallet;
        this.status = VerificationStatus.PENDING;
        this.retryCount = 0;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getNoteId() {
        return noteId;
    }

    public void setNoteId(Long noteId) {
        this.noteId = noteId;
    }

    public String getTxHash() {
        return txHash;
    }

    public void setTxHash(String txHash) {
        this.txHash = txHash;
    }

    public String getContentHash() {
        return contentHash;
    }

    public void setContentHash(String contentHash) {
        this.contentHash = contentHash;
    }

    public String getOwnerWallet() {
        return ownerWallet;
    }

    public void setOwnerWallet(String ownerWallet) {
        this.ownerWallet = ownerWallet;
    }

    public VerificationStatus getStatus() {
        return status;
    }

    public void setStatus(VerificationStatus status) {
        this.status = status;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public Integer getMaxRetries() {
        return maxRetries;
    }

    public void setMaxRetries(Integer maxRetries) {
        this.maxRetries = maxRetries;
    }

    public String getLastError() {
        return lastError;
    }

    public void setLastError(String lastError) {
        this.lastError = lastError;
    }

    public OffsetDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(OffsetDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getBlockchainContentHash() {
        return blockchainContentHash;
    }

    public void setBlockchainContentHash(String blockchainContentHash) {
        this.blockchainContentHash = blockchainContentHash;
    }

    public String getBlockchainAction() {
        return blockchainAction;
    }

    public void setBlockchainAction(String blockchainAction) {
        this.blockchainAction = blockchainAction;
    }

    public Boolean getHashMatch() {
        return hashMatch;
    }

    public void setHashMatch(Boolean hashMatch) {
        this.hashMatch = hashMatch;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PrePersist
    public void prePersist() {
        OffsetDateTime now = Instant.now().atOffset(ZoneOffset.UTC);
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now().atOffset(ZoneOffset.UTC);
    }

    // Helper methods
    public void incrementRetryCount() {
        this.retryCount = (this.retryCount == null ? 0 : this.retryCount) + 1;
    }

    public boolean hasExceededMaxRetries() {
        return this.retryCount != null && this.maxRetries != null && this.retryCount >= this.maxRetries;
    }

    @Override
    public String toString() {
        return "TransactionVerification{" +
                "id=" + id +
                ", noteId=" + noteId +
                ", txHash='" + txHash + '\'' +
                ", status=" + status +
                ", retryCount=" + retryCount +
                ", hashMatch=" + hashMatch +
                '}';
    }
}
