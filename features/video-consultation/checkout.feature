Feature: Checkout Process
  As a customer
  I want to complete the payment for my video consultation
  So that I can confirm my appointment

  Background:
    Given I am on the video consultation form
    And I have selected a service
    And I have scheduled an appointment
    And I have provided my contact information
    And I am on the checkout step

  Scenario: View payment form
    Then I should see the Stripe payment form
    And I should see the consultation fee
    And I should see a summary of my appointment details

  Scenario: Complete payment
    When I enter valid payment information
    And I submit the payment form
    Then the payment should be processed
    And I should be redirected to the confirmation page

  Scenario: Handle payment failure
    When I enter invalid payment information
    And I submit the payment form
    Then I should see a payment error message
    And I should remain on the checkout step
    And I should be able to try again

  Scenario: Send confirmation notification
    When the payment is successful
    Then a confirmation text message should be sent to my phone number
    And the message should include my appointment details
    And the message should include contact information for questions

  Scenario: Navigate between steps
    When I click the "Back" button
    Then I should return to the contact information step
    And my contact information should be preserved 