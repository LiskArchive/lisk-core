Feature: Transfer LSK

  As a user I want to transfer amount(LSK) from my account to other users

  Background: Client list
    Given I have list of clients

  Scenario: Transfer token to another account
    Given I have a lisk account
    And I have minimum balance in my account for transfer
      """
      "fees": {
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000",
      "dappWithdrawal": "10000000",
      "dappDeposit": "10000000"
      }
      """
    Then I should be able to send tokens to other account

  Scenario: Transfer token to self
    Given I have a lisk account
    And I have minimum balance in my account for transfer
      """
      "fees": {
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000",
      "dappWithdrawal": "10000000",
      "dappDeposit": "10000000"
      }
      """
    Then I should be able to transfer token to myself
