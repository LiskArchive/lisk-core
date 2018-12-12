Feature: Cast Vote

  As a user
  I want to cast my vote to delegate
  So that the delegate can maintain the blockchain

  Background: Client list
    Given I have list of clients

  Scenario: vote for delegate
    Given "thor" has a lisk account with balance 100 LSK tokens
    And I have minimum balance in my account for transaction "<vote>"
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
    When I cast my vote for a delegate
    Then the delegate should received my vote

  Scenario: vote for myself
    Given "thor" has a lisk account with balance 100 LSK tokens
    And I have minimum balance in my account for transaction "<vote>"
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
    Given "odin" has a account registered as delegate
    When I cast my vote for myself
    Then I should received my vote
