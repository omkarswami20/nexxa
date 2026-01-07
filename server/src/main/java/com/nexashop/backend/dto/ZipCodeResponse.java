package com.nexashop.backend.dto;

public class ZipCodeResponse {
    private String city;
    private String state;
    private String country;
    private String area;

    public ZipCodeResponse() {
    }

    public ZipCodeResponse(String city, String state, String country, String area) {
        this.city = city;
        this.state = state;
        this.country = country;
        this.area = area;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }
}

