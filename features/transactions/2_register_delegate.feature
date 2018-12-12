Feature: Register as a delegate

  As a user/miner/maintainer/investor
  I want to forge blocks and maintain blockchain
  So that the blockchain is reliable, secure and maintainable

  Background: Client list
    Given I have list of clients

  Scenario: Register user account as delegate
    Given "thor" has a lisk account with balance 100 LSK tokens
    And I have minimum balance in my account for transaction "<delegate>"
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
    When I register as a delegate
    Then "odin" has a account registered as delegate
