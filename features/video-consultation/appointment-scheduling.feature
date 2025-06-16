Feature: Appointment Scheduling
  As a customer
  I want to schedule my video consultation
  So that I can get help at a convenient time

  Background:
    Given I am on the video consultation form
    And I have selected a service
    And I am on the appointment scheduling step

  Scenario: View available dates
    Then I should see a calendar with available dates
    And dates in the past should be disabled
    And dates with no availability should be disabled
    And I should be able to scroll through the calendar
    # New requirement
    And I should only see technicians with the required skills for the selected service

  Scenario: View available time slots
    When I select an available date
    Then I should see a list of available time slots
    And each time slot should show the time in CT
    And time slots in the past should be disabled
    And time slots with no technician availability should be disabled

  Scenario: Select appointment time
    When I select an available time slot
    Then the time slot should be highlighted
    And a technician should be automatically assigned
    And the "Continue" button should be enabled

  Scenario: Cannot proceed without time selection
    Then the "Continue" button should be disabled
    When I try to proceed without selecting a time
    Then I should remain on the appointment scheduling step

  Scenario: Navigate between steps
    When I click the "Back" button
    Then I should return to the service selection step
    And my service selection should be preserved 