package com.testing.springpractice.family_tracker.DTO;

import com.mongodb.client.model.geojson.Point;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LocationResponse {
    private String userName;
    private double latitude;
    private double longitude;
    private LocalDateTime lastUpdated;
}
