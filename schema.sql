-- RentAPlace Database Schema
-- PostgreSQL

-- Users Table
CREATE TABLE "Users" (
    "Id" SERIAL PRIMARY KEY,
    "FirstName" VARCHAR(100) NOT NULL,
    "LastName" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "PasswordHash" TEXT NOT NULL,
    "Role" VARCHAR(20) NOT NULL DEFAULT 'User',  -- 'User' | 'Owner'
    "PhoneNumber" VARCHAR(20),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Properties Table
CREATE TABLE "Properties" (
    "Id" SERIAL PRIMARY KEY,
    "OwnerId" INT NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "Title" VARCHAR(255) NOT NULL,
    "Description" TEXT NOT NULL,
    "Location" VARCHAR(255) NOT NULL,
    "City" VARCHAR(100) NOT NULL,
    "PropertyType" VARCHAR(50) NOT NULL,  -- Apartment, Villa, House, Flat
    "PricePerNight" DECIMAL(10,2) NOT NULL,
    "MaxGuests" INT NOT NULL DEFAULT 1,
    "Bedrooms" INT NOT NULL DEFAULT 1,
    "Bathrooms" INT NOT NULL DEFAULT 1,
    "Rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ReviewCount" INT NOT NULL DEFAULT 0,
    "IsAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Property Images Table (up to 5 per property)
CREATE TABLE "PropertyImages" (
    "Id" SERIAL PRIMARY KEY,
    "PropertyId" INT NOT NULL REFERENCES "Properties"("Id") ON DELETE CASCADE,
    "ImageUrl" TEXT NOT NULL,
    "IsMain" BOOLEAN NOT NULL DEFAULT FALSE,
    "SortOrder" INT NOT NULL DEFAULT 0
);

-- Property Features Table
CREATE TABLE "PropertyFeatures" (
    "Id" SERIAL PRIMARY KEY,
    "PropertyId" INT NOT NULL REFERENCES "Properties"("Id") ON DELETE CASCADE,
    "FeatureName" VARCHAR(100) NOT NULL  -- Pool, BeachFacing, Garden, WiFi, AirConditioning, Gym, Parking, PetFriendly
);

-- Reservations Table
CREATE TABLE "Reservations" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INT NOT NULL REFERENCES "Users"("Id") ON DELETE RESTRICT,
    "PropertyId" INT NOT NULL REFERENCES "Properties"("Id") ON DELETE CASCADE,
    "CheckIn" TIMESTAMP NOT NULL,
    "CheckOut" TIMESTAMP NOT NULL,
    "Guests" INT NOT NULL DEFAULT 1,
    "TotalPrice" DECIMAL(10,2) NOT NULL,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Pending',  -- Pending, Confirmed, Cancelled
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Messaging Database (separate service)
-- Database: rentaplace_messaging

CREATE TABLE "Messages" (
    "Id" SERIAL PRIMARY KEY,
    "SenderId" INT NOT NULL,
    "SenderName" VARCHAR(200) NOT NULL,
    "ReceiverId" INT NOT NULL,
    "ReceiverName" VARCHAR(200) NOT NULL,
    "PropertyId" INT NOT NULL,
    "PropertyTitle" VARCHAR(255) NOT NULL,
    "Content" TEXT NOT NULL,
    "IsRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "SentAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed demo data
INSERT INTO "Users" ("FirstName","LastName","Email","PasswordHash","Role") VALUES
('Alice','Renter','user@rentaplace.com','$2a$11$hashedpassword','User'),
('Bob','Owner','owner@rentaplace.com','$2a$11$hashedpassword','Owner');
