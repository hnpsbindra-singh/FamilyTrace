package com.testing.springpractice.family_tracker.Controllers;

import com.testing.springpractice.family_tracker.DTO.LocationUpdateRequest;
import com.testing.springpractice.family_tracker.Service.LocationService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WsController {

    private final LocationService locationService;

    public WsController(LocationService locationService) {
        this.locationService = locationService;
    }

    @MessageMapping("/location")
    public void update(LocationUpdateRequest request){
         locationService.update(request);
    }


}
