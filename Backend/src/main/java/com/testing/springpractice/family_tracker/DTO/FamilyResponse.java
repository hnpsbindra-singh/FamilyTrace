package com.testing.springpractice.family_tracker.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FamilyResponse {
    private String id;
    private String familyName;
    private String familyCode;
    private String createdBy;
}
