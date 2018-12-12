Feature: Transfer LSK

  As a user I want to transfer amount(LSK) from my account to other users

  Background: Client list
    Given I have list of clients

  Scenario: Transfer token to another account
    Given "thor" has a lisk account with balance 100 LSK tokens
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
    Then I should be able to send tokens to other account

  Scenario: Transfer token to self
    Given "thor" has a lisk account with balance 100 LSK tokens
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
    Then I should be able to transfer token to myself
