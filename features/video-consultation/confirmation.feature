Feature: Appointment Confirmation
  As a customer
  I want to see confirmation of my video consultation
  So that I know my appointment is scheduled

  Background:
    Given I am on the video consultation form
    And I have completed the payment process
    And I am on the confirmation page

  Scenario: View confirmation details
    Then I should see a success message
    And I should see my appointment date and time
    And I should see the selected service
    And I should see the assigned technician's name
    And I should see my contact information

  Scenario: Receive confirmation notification
    Then I should receive a confirmation text message
    And the message should include my appointment details
    And the message should mention that I'll receive a link 5 minutes before the call

  Scenario: Navigate after confirmation
    When I click "Start Over"
    Then I should be returned to the service selection step
    And the form should be reset

  Scenario: Return to home
    When I click "Return to Home"
    Then I should be redirected to the home page 