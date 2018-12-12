
Feature: Create Lisk Account

  In order to use LSK coin
  As a user
  I want to create lisk account

  Scenario: Create account
    Given I have list of clients
    Given The node is forging
    When I create a lisk account
      | user    |
      | sheldon |
    And transfer 100LSK to all account from genesis account
    Then Validate if 100LSK was transfered was successful
