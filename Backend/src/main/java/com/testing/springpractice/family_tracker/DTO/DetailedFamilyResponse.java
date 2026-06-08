package com.testing.springpractice.family_tracker.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DetailedFamilyResponse {
    private String id;
    private String familyName;
    private String familyCode;
    private String createdBy;
    private List<String> memberIds = new ArrayList<>();
    private List<String> memberName = new ArrayList<>();
}
