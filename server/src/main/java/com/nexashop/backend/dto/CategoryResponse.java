package com.nexashop.backend.dto;

import com.nexashop.backend.entity.Category;

public class CategoryResponse {
    private Long id;
    private String name;
    private String description;

    public CategoryResponse() {
    }

    public CategoryResponse(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.description = category.getDescription();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

