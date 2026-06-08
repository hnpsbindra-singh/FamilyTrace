package com.testing.springpractice.family_tracker.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Family {
    @Id
    private String id;
    private String familyName;
    @Indexed(unique = true)
    private String familyCode;
    private String createdBy;
    private List<String> memberIds = new ArrayList<>();
}
