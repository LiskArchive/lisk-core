Feature: Lisk Accounts

  As a user
  I want to see details for my account
  So that I can validate my balance and other details

  Background: Accounts
    Given "thor" has a lisk account with balance 100 LSK tokens
    And "loki" has a account with second signature
    And "odin" has a account registered as delegate
    And "heimdall" has a multisignature account with "thor", "odin"

  Scenario: List accounts
    Given The network is moving
    When I look for list of accounts without any params
    Then I should get list of accounts sorted by "balance" in "asc" order
    When I search for a particular account "16313739661670634666L"
    Then I should get my account details

  Scenario Outline: List account
    When I look for list of account with "<params>"
    Then I should get account details according to "<params>"

    Examples:
      | params                                                                           |
      | address=7333160697601118486L                                                     |
      | publicKey=6d013be60f6f402a56f43df88582759e2cd3c69f84fac6084d86230cfdd72c35       |
      | secondPublicKey=af365443121487c4935a33cd632ea6e6308a0e9b2e488de38a6a2e5aca96e8eb |
      | username=odin                                                                    |
      | limit=100                                                                        |
      | offset=2                                                                         |
      | sort=balance:asc                                                                 |
      | sort=balance:desc                                                                |

  Scenario: Searches multisignature groups for a specific address .
    When "heimdall" requests "multisignature_groups"
    Then "heimdall" should get "multisignature_groups" account

  Scenario: List all members belonging to a particular multisignature group.
    When "thor" and "odin" requests "multisignature_memberships" account
    Then "thor" and "odin" should get "multisignature_memberships" account
