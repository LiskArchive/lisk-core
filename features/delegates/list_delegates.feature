Feature: List Delegates
  In order to cast vote or check forging blocks or maintainers
  As a user
  I want to see the list of users who are delegates

  Background: Client list
    Given I have list of clients

  Scenario Outline: List delegates with params
    Given The network is moving
    When I request for delegates list with "<params>"
    Then I should get delegates according to params

    Examples:
      | params                                                                                                                                                                   |
      | address                                                                                                                                                                  |
      | username                                                                                                                                                                 |
      | publicKey                                                                                                                                                                |
      | secondPublicKey                                                                                                                                                          |
      | search                                                                                                                                                                   |
      | offset                                                                                                                                                                   |
      | limit                                                                                                                                                                    |
      | sort=username:asc, username:desc, rank:asc, rank:desc, productivity:asc, productivity:desc, missedBlocks:asc, missedBlocks:desc, producedBlocks:asc, producedBlocks:desc |


  Scenario Outline: List of the next forgers in this delegate round
    Given The network is moving
    When I request for forging delegates list with "<params>"
    Then I should get delegates according to params

    Examples:
      | params | values |
      | offset | 0      |
      | limit  | 10     |

  Scenario Outline: Get delegates forging statistics
    Given The network is moving
    When I request for forging delegates statistics with "<params>"
    Then I should get forging delegate statistics

    Examples:
      | params        | values |
      | address       |        |
      | fromTimestamp |        |
      | toTimestamp   |        |
