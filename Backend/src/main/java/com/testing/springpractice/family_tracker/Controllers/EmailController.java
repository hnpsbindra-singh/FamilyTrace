package com.testing.springpractice.family_tracker.Controllers;

import com.testing.springpractice.family_tracker.DTO.MessageRequest;
import com.testing.springpractice.family_tracker.DTO.MessageResponse;
import com.testing.springpractice.family_tracker.Service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/message")
public class EmailController {
    @Autowired
    MessageService messageService;
    @PostMapping("/{familyId}/{userId}")
    public String send(@RequestBody MessageRequest request,
                                @PathVariable String familyId,
                                @PathVariable String userId){
        return messageService.send(request, familyId, userId);

    }
}
