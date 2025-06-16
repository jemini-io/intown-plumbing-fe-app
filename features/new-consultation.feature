Scenario: Send notifications to the customer
  Given I am on the new consultation page
  When I book a consultation
  Then send the following text message to the customer
    """
    Hey {name},

    You are confirmed for {date} at {time}.

    You'll receive a link 5 mins before your scheduled call.

    For questions or to reschedule call or text: (469) 936-4227.
    """

Scenario: Send reminder to the customer
  Given I have booked a consultation
  And the consultation is in 5 minutes
  Then send the following text message to the customer
    """
    {name}, you have a consultation in 5 minutes.

    Here's the link to the consultation: {link}.
    """
