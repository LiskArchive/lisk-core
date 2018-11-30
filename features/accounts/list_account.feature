Feature: List Lisk Account

  As a user
  I want to see details for my account
  So that I can validate my balance and other details

  Scenario: List accounts
    Given The network is moving
    When I look for list of accounts without any params
    Then I should get list of accounts sorted by "balance" in "asc" order
    When I search for a particular account "16313739661670634666L"
    Then I should get my account details

  Scenario Outline: List accounts
    When I look for list of accounts with "params" and "value"
    Then I should get account details according to "params" and "value"

    Examples:
      | params | value        |
      | limit  | 2            |
      | offset | 0            |
      | sort   | balance:asc  |
      | sort   | balance:desc |

  Scenario Outline: Searches for the specified account which is member of any multisignature groups.
    Given I have the lisk accounts
    When I make a request to "multisignature_groups" with my "address"
    Then I should get account details associated with params

  Scenario Outline: List all members belonging to a particular multisignature group.
    Given I have the lisk accounts
    When I make a request to "multisignature_memberships" with my "address"
    Then I should get account details associated with params
