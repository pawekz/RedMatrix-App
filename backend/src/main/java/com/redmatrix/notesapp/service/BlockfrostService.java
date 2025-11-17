package com.redmatrix.notesapp.service;

import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

@Service
public class BlockfrostService {
    
    private static final Logger logger = LoggerFactory.getLogger(BlockfrostService.class);
    
    private final RestTemplate restTemplate;
    private final String projectId;
    private final String apiUrl;
    
    public BlockfrostService(
            @Value("${blockfrost.project.id}") String projectId,
            @Value("${blockfrost.api.url}") String apiUrl) {
        this.restTemplate = new RestTemplate();
        this.projectId = projectId;
        this.apiUrl = apiUrl;
        
        if (projectId == null || projectId.isEmpty() || projectId.equals("your_blockfrost_project_id_here")) {
            logger.warn("Blockfrost Project ID is not configured. Please set BLOCKFROST_PROJECT_ID environment variable or blockfrost.project.id property.");
        }
    }
    
    /**
     * Fetch transaction metadata from Blockfrost API
     * @param txHash Transaction hash
     * @return List of metadata objects
     */
    public List<Map<String, Object>> getTransactionMetadata(String txHash) {
        if (projectId == null || projectId.isEmpty() || projectId.equals("your_blockfrost_project_id_here")) {
            throw new IllegalStateException("Blockfrost Project ID not configured. Please set BLOCKFROST_PROJECT_ID environment variable.");
        }
        
        String url = apiUrl + "/txs/" + txHash + "/metadata";
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("project_id", projectId);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        try {
            logger.info("Fetching transaction metadata for hash: {}", txHash);
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            
            logger.info("Successfully fetched metadata for transaction: {}", txHash);
            return response.getBody();
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("Transaction not found: {}", txHash);
            throw new RuntimeException("Transaction not found: " + txHash, e);
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            logger.error("Blockfrost API error for hash {}: {} - {}", txHash, e.getStatusCode(), e.getMessage());
            throw new RuntimeException("Blockfrost API error: " + e.getStatusCode() + " - " + e.getMessage(), e);
        } catch (RestClientException e) {
            logger.error("Error fetching transaction metadata for hash {}: {}", txHash, e.getMessage());
            throw new RuntimeException("Failed to fetch transaction metadata: " + e.getMessage(), e);
        }
    }
}

