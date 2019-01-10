Feature: Transfer LSK

  As a user I want to transfer amount(LSK) from my account to other users

  Scenario: Transfer token to another account
    Given "thor" has a lisk account with balance 100 LSK tokens
    Then "thor" should be able to send 1LSK tokens to "loki"

  Scenario: Transfer token to self
    Given "thor" has a lisk account with balance 100 LSK tokens
    Then "thor" should be able to send 1LSK tokens to himself
