Feature: Register Second Signature on account

  As a user I want to secure my account with second signature

  Background: Client list
    Given I have list of clients

  Scenario: Register second signature
    Given "thor" has a lisk account with balance 100 LSK tokens
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
    Then "loki" has a account with second signature

  Scenario: Transfer token to another account with second signature enabled
    Given "loki" has a account with second signature
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
    Given "loki" has a account with second signature
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
