package com.nexorcrm.backend.service;

import com.nexorcrm.backend.entity.CompanyLocation;
import com.nexorcrm.backend.repo.CompanyLocationRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class GeoFenceService {

    private static final double EARTH_RADIUS_METERS = 6_371_000.0;
    private static final double MAX_ACCEPTABLE_ACCURACY = 100.0;

    private final CompanyLocationRepository locationRepository;

    public GeoFenceService(CompanyLocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    /**
     * Find the closest location to the given coordinates within geofence.
     * Returns empty if no location found within any geofence.
     */
    public Optional<CompanyLocation> findClosestLocation(double lat, double lng) {
        return locationRepository.findByDeletedFalseAndActiveTrueOrderByNameAsc()
                .stream()
                .map(loc -> {
                    double distance = haversine(loc.getLatitude(), loc.getLongitude(), lat, lng);
                    return new LocationDistance(loc, distance);
                })
                .filter(ld -> ld.distance <= ld.location.getRadiusMeters())
                .min((a, b) -> Double.compare(a.distance, b.distance))
                .map(ld -> ld.location);
    }

    /**
     * Validate that the given coordinates are within the geofence of the specified location.
     * Uses the Haversine formula — no external APIs.
     */
    public void validateWithinGeofence(Long locationId, double lat, double lng, double accuracy) {
        if (locationId == null) {
            return; // no location assigned — skip geofence check
        }

        if (accuracy > MAX_ACCEPTABLE_ACCURACY) {
            throw new IllegalArgumentException(
                "GPS accuracy too low (" + String.format("%.0f", accuracy) + "m). "
                + "Please move to an open area and try again. Maximum allowed: " + (int) MAX_ACCEPTABLE_ACCURACY + "m.");
        }

        CompanyLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Company location not found"));

        double distance = haversine(location.getLatitude(), location.getLongitude(), lat, lng);

        if (distance > location.getRadiusMeters()) {
            throw new IllegalArgumentException(
                "You are " + String.format("%.0f", distance) + "m away from " + location.getName()
                + ". You must be within " + location.getRadiusMeters() + "m to check in.");
        }
    }

    /**
     * Haversine formula: computes great-circle distance in meters between two lat/lng points.
     */
    public static double haversine(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }

    private static class LocationDistance {
        CompanyLocation location;
        double distance;
        LocationDistance(CompanyLocation location, double distance) {
            this.location = location;
            this.distance = distance;
        }
    }
}
