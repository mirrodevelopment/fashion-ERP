package com.fashionerp.collection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CollectionActivityRepository extends JpaRepository<CollectionActivity, UUID> {
    List<CollectionActivity> findByCollectionIdOrderByActivityDateDesc(UUID collectionId);
}
