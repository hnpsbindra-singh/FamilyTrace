package com.testing.springpractice.family_tracker.DTO;

import com.testing.springpractice.family_tracker.Model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileRequest {
    private String name;
    private String username;
    private String password;
    private Role role;
}
