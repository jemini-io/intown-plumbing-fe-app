Feature: Service Selection
  As a customer
  I want to select a service for my video consultation
  So that I can get help with my specific plumbing needs

  Background:
    Given I am on the video consultation form
    And I am on the service selection step

  Scenario: View available services
    Then I should see a list of available services
    And each service should have a name and description
    And the services should be clickable

  Scenario: Select a service
    When I click on a service
    Then the service should be highlighted
    And the "Continue" button should be enabled

  Scenario: Cannot proceed without service selection
    Then the "Continue" button should be disabled
    When I try to proceed without selecting a service
    Then I should remain on the service selection step 