Feature: Register a multisignature account

  As a user or community
  I should be able to register for a multisignature account
  So that as user or community we can benefit from the authority over a single account

  Background: Client list
    Given I have list of clients

  Scenario: Register multisignature account for self
    Given I have a lisk account
    And I have minimum balance in my account for transaction "<multisignature>"
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
    Then I should be able to register for multisignature account

  Scenario: Register multisignature account minimum keys group
    Given I have a lisk account
    And I have minimum balance in my account for transaction "<multisignature>"
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
    When I have a "minimum" users with whom I want to setup multisignature account
      | user    |
      | sheldon |
      | raj     |
      | lenard  |
      | howard  |
    Then I register for multisignature account with "2" keys group
    When the user "sheldon", "raj", "lenard" and "howard" send the signature for confirmation
    Then the signature should be accepted
    And multisignature account should be created

  Scenario: Register multisignature account maximum keys group
    Given I have a lisk account
    And I have minimum balance in my account for transaction "<multisignature>"
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
    When I have a maximum of "15" users with whom I want to setup multisignature account
    Then I register for multisignature account with "15" keys group
    When all the "15" users send the signature for confirmation
    Then the signature should be accepted
    And multisignature account should be created

  Scenario: Transfer tokens using my multisignature account
    Given I have minimum balance in my account for transaction "<send>"
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
    When I should be able to send tokens to other account

  Scenario: Transfer tokens using minimum keys group multisignature account
    Given I have minimum balance in my account for transaction "<send>"
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
    When I initiate a tranfer transaction with "minimum" keys group
    And the "minimum" required users send the signatures
    Then the multisignature tranfer with minimum keys group should be successful

  Scenario: Transfer tokens using maximum keys group multisignature account
    Given I have minimum balance in my account for transaction "<send>"
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
    When I initiate a tranfer transaction with "maximum" keys group
    And the "maximum" required users send the signatures
    Then the multisignature tranfer with minimum keys group should be successful
