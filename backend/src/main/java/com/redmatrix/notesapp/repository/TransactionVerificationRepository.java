package com.redmatrix.notesapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.redmatrix.notesapp.entity.TransactionVerification;
import com.redmatrix.notesapp.entity.TransactionVerification.VerificationStatus;

/**
 * Repository for TransactionVerification entity.
 * Provides methods to query and manage transaction verification records.
 */
public interface TransactionVerificationRepository extends JpaRepository<TransactionVerification, Long> {

    /**
     * Find all verifications with a specific status
     */
    List<TransactionVerification> findByStatus(VerificationStatus status);

    /**
     * Find pending verifications that haven't exceeded max retries
     * Orders by retry count (prioritize those with fewer retries)
     */
    @Query("SELECT tv FROM TransactionVerification tv WHERE tv.status = :status AND tv.retryCount < tv.maxRetries ORDER BY tv.retryCount ASC, tv.createdAt ASC")
    List<TransactionVerification> findPendingVerifications(@Param("status") VerificationStatus status);

    /**
     * Find all verifications for a specific note
     */
    List<TransactionVerification> findByNoteIdOrderByCreatedAtDesc(Long noteId);

    /**
     * Find the latest verification for a specific note
     */
    Optional<TransactionVerification> findFirstByNoteIdOrderByCreatedAtDesc(Long noteId);

    /**
     * Find verification by transaction hash
     */
    Optional<TransactionVerification> findByTxHash(String txHash);

    /**
     * Check if a verification already exists for a transaction hash
     */
    boolean existsByTxHash(String txHash);

    /**
     * Find all verifications for a specific wallet
     */
    List<TransactionVerification> findByOwnerWalletOrderByCreatedAtDesc(String ownerWallet);

    /**
     * Count verifications by status
     */
    long countByStatus(VerificationStatus status);

    /**
     * Find verifications that need retry (PENDING or FAILED with retries remaining)
     */
    @Query("SELECT tv FROM TransactionVerification tv WHERE " +
           "(tv.status = 'PENDING' OR tv.status = 'FAILED') " +
           "AND tv.retryCount < tv.maxRetries " +
           "ORDER BY tv.retryCount ASC, tv.createdAt ASC")
    List<TransactionVerification> findVerificationsNeedingRetry();

    /**
     * Find verifications that should be marked as expired
     */
    @Query("SELECT tv FROM TransactionVerification tv WHERE " +
           "(tv.status = 'PENDING' OR tv.status = 'FAILED') " +
           "AND tv.retryCount >= tv.maxRetries")
    List<TransactionVerification> findExpiredVerifications();

    /**
     * Get verification statistics
     */
    @Query("SELECT tv.status, COUNT(tv) FROM TransactionVerification tv GROUP BY tv.status")
    List<Object[]> getVerificationStatistics();

    /**
     * Find recent verifications (limit by count)
     */
    @Query("SELECT tv FROM TransactionVerification tv ORDER BY tv.createdAt DESC LIMIT :limit")
    List<TransactionVerification> findRecentVerifications(@Param("limit") int limit);
}
