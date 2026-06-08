package com.testing.springpractice.family_tracker.Controllers;

import com.testing.springpractice.family_tracker.DTO.LocationResponse;
import com.testing.springpractice.family_tracker.DTO.LocationUpdateRequest;
import com.testing.springpractice.family_tracker.Service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/location")
public class LocationController {
    @Autowired
    LocationService locationService;

    @GetMapping("/me")
    public LocationResponse getLocation(){
        return locationService.getLocation();
    }
    @PostMapping("/update")
    public LocationResponse update(@RequestBody LocationUpdateRequest request){
        return locationService.update(request);
    }
    @GetMapping("/{familyId}")
    public List<LocationResponse> getAll(@PathVariable String familyId){
        return locationService.getAll(familyId);
    }
    @GetMapping("{familyId}/{userId}")
    public LocationResponse get(@PathVariable String familyId, @PathVariable String userId){
        return locationService.get(familyId, userId);
    }
}
