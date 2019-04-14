Feature: Register a multisignature account

  As a user or community
  I should be able to register for a multisignature account
  So that as user or community we can benefit from the authority over a single account

  Scenario: Register multisignature account minimum keys group
    Given "heimdall" has a lisk account with balance 100 LSK tokens
    When "heimdall" creates a multisignature account with "thor", "odin"
    Then "thor", "odin" has a multisignature account with "heimdall"
    Then I should be able to transact using multisignature account I created

  Scenario: Register multisignature account with maximum keys group
    Given I have 16 lisk account with 100 LSK tokens
    When I create a multisignature account with 15 accounts
    Then I should be able to transact using multisignature account I created
