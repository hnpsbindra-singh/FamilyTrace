package com.testing.springpractice.family_tracker.Controllers;

import com.testing.springpractice.family_tracker.DTO.DetailedFamilyResponse;
import com.testing.springpractice.family_tracker.DTO.FamilyRequest;
import com.testing.springpractice.family_tracker.DTO.FamilyResponse;
import com.testing.springpractice.family_tracker.DTO.JoinFamilyRequest;
import com.testing.springpractice.family_tracker.Service.FamilyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/family")
public class FamilyController {
    @Autowired
    FamilyService familyService;
    @PostMapping("/create")
    public FamilyResponse Create(@RequestBody FamilyRequest request){
        return familyService.Create(request);
    }
    @PostMapping("/join")
    public FamilyResponse join(@RequestBody JoinFamilyRequest request){
        return familyService.join(request);
    }

    @GetMapping("/viewAllFamilies")
    public List<FamilyResponse> viewAll() {
        return familyService.viewAll();
    }

    @GetMapping("/FamilyDetails")
    public DetailedFamilyResponse view(@RequestParam String familyId) {
        return familyService.view(familyId);
    }
    @DeleteMapping("/leave")
    public String delete(@RequestParam String familyId) {
        return familyService.delete(familyId);
    }


}
