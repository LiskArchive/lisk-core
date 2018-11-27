Feature: Register Second Signature on account

  As a user I want to secure my account with second signature

  Background: Client list
    Given I have list of clients

  Scenario: Register second signature
    Given I have a lisk account
    And I have minimum balance in my account for transaction "<secondSignature>"
      """
      "fees": {
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000"
      }
      """
    When I register for second signature on my account
    Then I have a account with second signature enabled

  Scenario: Transfer token to another account with second signature enabled
    Given I have a account with second signature enabled
    And I have minimum balance in my account for transaction "<send>"
      """
      "fees": {
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000"
      }
      """
    When I transfer token to another account using second signature
    Then the transfer should be successful

  Scenario: Transfer token to self with second signature enabled
    Given I have a account with second signature enabled
    And I have minimum balance in my account for transaction "<send>"
      """
      "fees": {
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000"
      }
      """
    When I transfer token to self using second signature
    Then the transfer should be successful
