package com.testing.springpractice.family_tracker.Service;

import com.testing.springpractice.family_tracker.DTO.MessageRequest;
import com.testing.springpractice.family_tracker.DTO.MessageResponse;
import com.testing.springpractice.family_tracker.Model.Family;
import com.testing.springpractice.family_tracker.Model.Users;
import com.testing.springpractice.family_tracker.Repository.FamilyRepo;
import com.testing.springpractice.family_tracker.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class MessageService {
    @Autowired
    FamilyRepo familyRepo;
    @Autowired
    UserRepo userRepo;
    @Autowired
    EmailService emailService;
    public String send(MessageRequest request, String familyId, String userId) {
        Family family = familyRepo.findById(familyId)
                .orElseThrow(()->new RuntimeException("Family Not Found"));

        Authentication authentication = SecurityContextHolder
                .getContext().getAuthentication();
        String username = authentication.getName();
        Users sender = userRepo.findByUsername(username);


        Users receiver = userRepo.findById(userId)
                .orElseThrow(()->new RuntimeException("receiver not found"));

        if(!(family.getMemberIds().contains(sender.getId())
                && family.getMemberIds().contains(receiver.getId()))){
            throw new RuntimeException("Invalid Access");
        }
        emailService.sendMessage(receiver.getUsername(), request.getSubject(), request.getDescription());
        return "Message Sent Success";
    }
}
