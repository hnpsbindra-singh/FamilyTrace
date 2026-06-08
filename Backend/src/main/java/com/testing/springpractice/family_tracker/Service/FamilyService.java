package com.testing.springpractice.family_tracker.Service;

import com.testing.springpractice.family_tracker.DTO.DetailedFamilyResponse;
import com.testing.springpractice.family_tracker.DTO.FamilyRequest;
import com.testing.springpractice.family_tracker.DTO.FamilyResponse;
import com.testing.springpractice.family_tracker.DTO.JoinFamilyRequest;
import com.testing.springpractice.family_tracker.Model.Family;
import com.testing.springpractice.family_tracker.Model.Users;
import com.testing.springpractice.family_tracker.Repository.FamilyRepo;
import com.testing.springpractice.family_tracker.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FamilyService {
    @Autowired
    FamilyRepo familyRepo;
    @Autowired
    UserRepo userRepo;
    public FamilyResponse Create(FamilyRequest request) {
        Family family = new Family();
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();
        String username = authentication.getName();
        Users user = userRepo.findByUsername(username);

        family.setFamilyName(request.getFamilyName());
        family.setFamilyCode(request.getFamilyCode());
        family.setCreatedBy(user.getId());
        family.getMemberIds().add(user.getId());
        Family saved = familyRepo.save(family);
        user.getFamilyIds().add(saved.getId());
        userRepo.save(user);
        return mapToFamilyResponse(saved);
    }

    private FamilyResponse mapToFamilyResponse(Family saved) {
        FamilyResponse familyResponse  = new FamilyResponse();
        familyResponse.setId(saved.getId());
        Users user = userRepo.findById(saved.getCreatedBy()).orElseThrow(()->new
                RuntimeException("Error finding admin"));
        familyResponse.setCreatedBy(user.getName());
        familyResponse.setFamilyCode(saved.getFamilyCode());
        familyResponse.setFamilyName(saved.getFamilyName());
        return familyResponse;
    }

    public FamilyResponse join(JoinFamilyRequest request) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Users user = userRepo.findByUsername(username);
        Family family = Optional.ofNullable(
                familyRepo.findByFamilyCode(request.getFamilyCode())
        ).orElseThrow(() ->
                new RuntimeException("Invalid family code"));
        if(user.getFamilyIds().contains(family.getId())){
            throw new RuntimeException("Already joined");
        }
        family.getMemberIds().add(user.getId());
        user.getFamilyIds().add(family.getId());
        userRepo.save(user);
        Family saved = familyRepo.save(family);
        return mapToFamilyResponse(saved);
    }

    public List<FamilyResponse> viewAll() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Users user = Optional.ofNullable(
                userRepo.findByUsername(username)
        ).orElseThrow(() ->
                new RuntimeException("User not found"));
        List<Family> families = familyRepo.findByMemberIdsContains(user.getId());
        List<FamilyResponse> res = new ArrayList<>();
        for (int i = 0; i < families.size(); i++) {
            res.add(mapToFamilyResponse(families.get(i)));
        }
        return res;
    }

    public DetailedFamilyResponse view(String familyId) {
        Family family = familyRepo.findById(familyId)
                .orElseThrow(() ->
                        new RuntimeException("Invalid Family"));
        DetailedFamilyResponse res = new DetailedFamilyResponse();
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Users user = userRepo.findByUsername(username);
        if(!family.getMemberIds().contains(user.getId())){
            throw new RuntimeException("Invalid Access");
        }
        res.setId(family.getId());
        res.setFamilyName(family.getFamilyName());
        res.setFamilyCode(family.getFamilyCode());
        Users creator = userRepo.findById(family.getCreatedBy())
                .orElseThrow(() ->
                        new RuntimeException("Creator not found"));

        res.setCreatedBy(creator.getName());
        List<String> memberIds = new ArrayList<>();
        List<String> memberNames = new ArrayList<>();
        for (String memberId : family.getMemberIds()) {

            Users member = userRepo.findById(memberId)
                    .orElseThrow(() ->
                            new RuntimeException("Member not found"));

            memberIds.add(member.getId());
            memberNames.add(member.getName());
        }
        res.setMemberIds(memberIds);
        res.setMemberName(memberNames);

        return res;
    }

    public String delete(String familyId) {
        Family family = familyRepo.findById(familyId)
                .orElseThrow(() ->
                        new RuntimeException("Invalid Family"));
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Users user = userRepo.findByUsername(username);
        if(family.getCreatedBy().equals(user.getId())){
            throw new RuntimeException(
                    "Owner cannot leave"
            );
        }
        if(!family.getMemberIds().contains(user.getId())){
            throw new RuntimeException("Invalid deletion");
        }
        family.getMemberIds().remove(user.getId());
        user.getFamilyIds().remove(family.getId());
        userRepo.save(user);
        familyRepo.save(family);
        return "left the family Successfully";
    }
}
