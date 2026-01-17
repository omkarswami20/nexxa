package com.nexashop.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexashop.backend.dto.ZipCodeResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

@Service
public class ZipCodeService {

    private static final Logger logger = LoggerFactory.getLogger(ZipCodeService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.zipcode.api.enabled:true}")
    private boolean zipCodeApiEnabled;

    @Value("${app.zipcode.api.url:https://api.zippopotam.us}")
    private String zipCodeApiUrl;

    @Value("${app.zipcode.api.country:IN}")
    private String defaultCountry;

    public ZipCodeService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Lookup address details from zip code
     * @param zipCode The zip/postal code
     * @param country Optional country code (defaults to configured country)
     * @return ZipCodeResponse with city, state, country, area
     * @throws IllegalArgumentException if zip code is invalid or API call fails
     */
    public ZipCodeResponse lookupZipCode(String zipCode, String country) {
        if (!zipCodeApiEnabled) {
            logger.debug("Zip code API is disabled");
            throw new IllegalArgumentException("Zip code lookup is currently disabled");
        }

        if (zipCode == null || zipCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Zip code cannot be empty");
        }

        String countryCode = (country != null && !country.trim().isEmpty()) ? country : defaultCountry;
        String url = String.format("%s/%s/%s", zipCodeApiUrl, countryCode.toLowerCase(), zipCode.trim());

        try {
            logger.debug("Calling zip code API: {}", url);
            String response = restTemplate.getForObject(url, String.class);

            if (response == null || response.trim().isEmpty()) {
                throw new IllegalArgumentException("Invalid response from zip code API");
            }

            return parseZippopotamResponse(response, countryCode);

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            if (e.getStatusCode() == org.springframework.http.HttpStatus.NOT_FOUND) {
                logger.info("Zip code {} not found for country {}", zipCode, countryCode);
                return null;
            }
            logger.error("HTTP error fetching zip code data for {}: {}", zipCode, e.getMessage());
            throw new IllegalArgumentException("External API error: " + e.getMessage());
        } catch (RestClientException e) {
            logger.error("Failed to fetch zip code data for {}: {}", zipCode, e.getMessage());
            throw new IllegalArgumentException("Invalid zip code or unable to fetch address details");
        } catch (Exception e) {
            logger.error("Unexpected error while looking up zip code {}: {}", zipCode, e.getMessage());
            throw new IllegalArgumentException("Failed to lookup zip code: " + e.getMessage());
        }
    }

    /**
     * Parse Zippopotam.us API response
     */
    private ZipCodeResponse parseZippopotamResponse(String jsonResponse, String countryCode) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);

            // Extract country name
            String country = root.has("country") ? root.get("country").asText() : countryCode;

            // Extract place information (usually first place in array)
            JsonNode places = root.get("places");
            if (places == null || !places.isArray() || places.size() == 0) {
                throw new IllegalArgumentException("No location data found for this zip code");
            }

            JsonNode place = places.get(0);
            String city = place.has("place name") ? place.get("place name").asText() : null;
            String state = place.has("state") ? place.get("state").asText() : null;
            String area = place.has("place name") ? place.get("place name").asText() : null;

            if (city == null || state == null) {
                throw new IllegalArgumentException("Incomplete address data received from API");
            }

            return new ZipCodeResponse(city, state, country, area);

        } catch (Exception e) {
            logger.error("Failed to parse zip code API response: {}", e.getMessage());
            throw new IllegalArgumentException("Failed to parse address data: " + e.getMessage());
        }
    }
}

