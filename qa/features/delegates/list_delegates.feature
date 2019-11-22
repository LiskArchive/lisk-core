Feature: List Delegates
  In order to cast vote or check forging blocks or maintainers
  As a user
  I want to see the list of users who are delegates

  Scenario Outline: List delegates with params
    When I request for delegates list with "<params>"
    Then I should get delegates according to "<params>"

    Examples:
      | params                                                                     |
      | address=9188714956982834108L                                               |
      | username=genesis_1                                                         |
      | publicKey=1d4677e06f870449f271f859e299e3514718e4b8498c1bd832daa7843b83d9c5 |
      | search=genesis_18                                                          |
      | offset=3                                                                   |
      | limit=20                                                                   |
      | sort=username:asc                                                          |
      | sort=username:desc                                                         |
      | sort=productivity:asc                                                      |
      | sort=productivity:desc                                                     |
      | sort=missedBlocks:asc                                                      |
      | sort=missedBlocks:desc                                                     |
      | sort=producedBlocks:asc                                                    |
      | sort=producedBlocks:desc                                                   |


  Scenario Outline: List of the next forgers in this delegate round
    When I request for forging delegates list with "<params>"
    Then I should get next forging delegates list according to "<params>"

    Examples:
      | params    |
      | offset=0  |
      | limit=101 |

  Scenario Outline: Get delegates forging statistics
    When I request for forging delegates statistics "9188714956982834108L" with "<params>"
    Then I should get forging delegate statistics

    Examples:
      | params                 |
      | fromTimestamp=0        |
      | toTimestamp=1525861914 |
