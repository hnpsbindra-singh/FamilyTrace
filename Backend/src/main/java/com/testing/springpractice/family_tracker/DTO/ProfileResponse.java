package com.testing.springpractice.family_tracker.DTO;

import com.testing.springpractice.family_tracker.Model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponse {
    private String id;
    private String name;
    private String username;
    private Role role;
}
