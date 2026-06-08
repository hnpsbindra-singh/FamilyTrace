package com.testing.springpractice.family_tracker.Repository;

import com.testing.springpractice.family_tracker.Model.UserLocation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LocationRepo extends MongoRepository<UserLocation, String> {
    UserLocation findByUserId(String userId);
}
