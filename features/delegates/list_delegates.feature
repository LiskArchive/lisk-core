Feature: List Delegates
  In order to cast vote or check forging blocks or maintainers
  As a user
  I want to see the list of users who are delegates

  Scenario Outline: List delegates with params
    Given The delegates are enabled to forge
    When I request for delegates list with "<params>"
    Then I should get delegates according to "<params>"

    Examples:
      | params                                                                     |
      | address=8273455169423958419L                                               |
      | username=genesis_1                                                         |
      | publicKey=9d3058175acab969f41ad9b86f7a2926c74258670fe56b37c429c01fca9f2f0f |
      | search=genesis_18                                                          |
      | offset=3                                                                   |
      | limit=20                                                                   |
      | sort=username:asc                                                          |
      | sort=username:desc                                                         |
      | sort=rank:asc                                                              |
      | sort=rank:desc                                                             |
      | sort=productivity:asc                                                      |
      | sort=productivity:desc                                                     |
      | sort=missedBlocks:asc                                                      |
      | sort=missedBlocks:desc                                                     |
      | sort=producedBlocks:asc                                                    |
      | sort=producedBlocks:desc                                                   |


  Scenario Outline: List of the next forgers in this delegate round
    Given The delegates are enabled to forge
    When I request for forging delegates list with "<params>"
    Then I should get next forging delegates list according to "<params>"

    Examples:
      | params    |
      | offset=0  |
      | limit=101 |

  Scenario Outline: Get delegates forging statistics
    Given The delegates are enabled to forge
    When I request for forging delegates statistics "8273455169423958419L" with "<params>"
    Then I should get forging delegate statistics

    Examples:
      | params                 |
      | fromTimestamp=0        |
      | toTimestamp=1525861914 |
