package com.testing.springpractice.family_tracker.Service;

import com.testing.springpractice.family_tracker.DTO.LocationResponse;
import com.testing.springpractice.family_tracker.DTO.LocationUpdateRequest;
import com.testing.springpractice.family_tracker.Model.Family;
import com.testing.springpractice.family_tracker.Model.UserLocation;
import com.testing.springpractice.family_tracker.Model.Users;
import com.testing.springpractice.family_tracker.Repository.FamilyRepo;
import com.testing.springpractice.family_tracker.Repository.LocationRepo;
import com.testing.springpractice.family_tracker.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.geo.Point;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class LocationService {
    @Autowired
    UserRepo userRepo;
    @Autowired
    LocationRepo locationRepo;
    @Autowired
    FamilyRepo familyRepo;
    @Autowired
    SimpMessagingTemplate simpMessagingTemplate;
    public LocationResponse getLocation() {
        Authentication authentication = SecurityContextHolder
                .getContext().getAuthentication();
        String username = authentication.getName();
        Users user = userRepo.findByUsername(username);
        if(user==null){
            throw new RuntimeException("Invalid User");
        }
        UserLocation userLocation = locationRepo.findByUserId(user.getId());
        if(userLocation == null){
            throw new RuntimeException("Location not found");
        }

        return mapTOLocationResponse(userLocation);
    }

    private LocationResponse mapTOLocationResponse(UserLocation userLocation) {
        LocationResponse locationResponse = new LocationResponse();
        locationResponse.setLastUpdated(userLocation.getLastUpdated());
        Point point = userLocation.getLocation();
        locationResponse.setLatitude(point.getY());
        locationResponse.setLongitude(point.getX());
        Users user = userRepo.findById(userLocation.getUserId()).orElseThrow(()->new RuntimeException("User not found"));

        locationResponse.setUserName(user.getName());
        return locationResponse;
    }

    public List<LocationResponse> getAll(String familyId) {
        Family family = familyRepo.findById(familyId).orElseThrow(()-> new RuntimeException("Invalid Family"));
        List<String> memberId = family.getMemberIds();
        Authentication authentication = SecurityContextHolder
                .getContext().getAuthentication();
        String username = authentication.getName();
        Users user = userRepo.findByUsername(username);
        if(!family.getMemberIds().contains(user.getId())){
            throw new RuntimeException("Invalid Access");
        }

        List<LocationResponse> res = new ArrayList<>();
        for (int i = 0; i < memberId.size(); i++) {
            UserLocation location = locationRepo.findByUserId(memberId.get(i));
            if(location != null){
                res.add(mapTOLocationResponse(location));
            }
        }
        return res;
    }

    public LocationResponse get(String familyId, String userId) {
        Family family = familyRepo.findById(familyId).orElseThrow(()-> new RuntimeException("Invalid Family"));
        Authentication authentication = SecurityContextHolder
                .getContext().getAuthentication();
        String username = authentication.getName();
        Users user = userRepo.findByUsername(username);
        Users user2 = userRepo.findById(userId).orElseThrow(()-> new RuntimeException("Invalid user"));
        if(!(family.getMemberIds().contains(user.getId())&&family.getMemberIds().contains(user2.getId()))){
            throw new RuntimeException("Invalid Accesss");
        }
        UserLocation location = locationRepo.findByUserId(user2.getId());
        if(location == null){
            throw new RuntimeException("Location not available");
        }
        return mapTOLocationResponse(location);

    }

    public LocationResponse update(LocationUpdateRequest request) {
        Authentication authentication = SecurityContextHolder
                .getContext().getAuthentication();
        String username = authentication.getName();
        Users user = userRepo.findByUsername(username);
        UserLocation location = locationRepo.findByUserId(user.getId());
        if(location == null){
            location = new UserLocation();
            location.setUserId(user.getId());
        }
        location.setLocation(new Point(request.getLongitude(), request.getLatitude()));
        location.setLastUpdated(LocalDateTime.now());
        locationRepo.save(location);
        LocationResponse response =
                mapTOLocationResponse(location);

        for(String familyId : user.getFamilyIds()){

            simpMessagingTemplate.convertAndSend(
                    "/topic/family/" + familyId,
                    response
            );
        }

        return response;
    }
}
