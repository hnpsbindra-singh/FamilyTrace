package com.testing.springpractice.family_tracker.Repository;

import com.testing.springpractice.family_tracker.Model.Family;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FamilyRepo extends MongoRepository<Family, String> {
    Family findByFamilyCode(String familyCode);
    List<Family> findByMemberIdsContains(String memberIds);
}
