@smoke @fast
Feature: List Lisk Account

  As a user
  I want to see details for my account
  So that I can validate my balance and other details

  Scenario Outline: List accounts
    Given I have the lisk accounts for "<user>"
    Examples:
      | user    |
      | sheldon |
      | raj     |
      | lenard  |
      | howard  |
    When I search for the account with "<params>"
    Then I should get account details associated with params

    Examples:
      | params          | values                    |
      | address         |                           |
      | publicKey       |                           |
      | secondPublicKey |                           |
      | username        |                           |
      | publicKey       |                           |
      | limit           |                           |
      | offset          |                           |
      | sort            | balance:asc, balance:desc |

  Scenario Outline: Searches for the specified account which is member of any multisignature groups.
    Given I have the lisk accounts for "<user>"
    Examples:
      | user    |
      | sheldon |
      | raj     |
      | lenard  |
      | howard  |
    When I make a request to "multisignature_groups" with my "address"
    Then I should get account details associated with params

  Scenario Outline: List all members belonging to a particular multisignature group.
    Given I have the lisk accounts for "<user>"
    Examples:
      | user    |
      | sheldon |
      | raj     |
      | lenard  |
      | howard  |
    When I make a request to "multisignature_memberships" with my "address"
    Then I should get account details associated with params
