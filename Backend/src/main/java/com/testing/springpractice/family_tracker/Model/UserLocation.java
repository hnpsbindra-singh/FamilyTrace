package com.testing.springpractice.family_tracker.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.Id;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.authentication.AuthenticationManager;

import java.time.LocalDateTime;

@Data
@Document
@AllArgsConstructor
@NoArgsConstructor
public class UserLocation {
    @Id
    private String id;
    private String userId;
    @GeoSpatialIndexed
    private Point location;
    private LocalDateTime lastUpdated;



}
