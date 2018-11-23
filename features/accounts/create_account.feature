@smoke @fast
Feature: Create Lisk Account

  In order to use LSK coin
  As a user
  I want to create lisk account

  Scenario Outline: Create account
    Given The node is running
    When "<user>" create a lisk account
    Then has a balance "<balance>"LSK in the account
    Examples:
      | user    | balance |
      | jon     | 25      |
      | amar    | 25      |
      | akbar   | 25      |
      | anthony | 25      |
