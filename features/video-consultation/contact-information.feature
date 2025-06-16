Feature: Contact Information
  As a customer
  I want to provide my contact information
  So that the technician can reach me for the consultation

  Background:
    Given I am on the video consultation form
    And I have selected a service
    And I have scheduled an appointment
    And I am on the contact information step

  Scenario: View appointment summary
    Then I should see a summary of my selected service
    And I should see my selected appointment date and time
    And I should see the assigned technician's name

  Scenario: Enter contact information
    When I enter my name
    And I enter my email address
    And I enter my phone number
    Then the "Continue" button should be enabled

  Scenario: Validate required fields
    When I try to proceed without entering all required fields
    Then I should see validation errors
    And I should remain on the contact information step

  Scenario: Validate email format
    When I enter an invalid email address
    Then I should see an email validation error
    And the "Continue" button should be disabled

  Scenario: Validate phone number format
    When I enter an invalid phone number
    Then I should see a phone number validation error
    And the "Continue" button should be disabled

  Scenario: Navigate between steps
    When I click the "Back" button
    Then I should return to the appointment scheduling step
    And my appointment selection should be preserved 