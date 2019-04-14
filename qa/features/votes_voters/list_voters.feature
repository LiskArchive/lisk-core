Feature: List Voters
  In order check votes that I have received
  As a delegate
  I want to see list of voters who have voted me

  Scenario Outline: List voters with params
    When I request for voters with "<params>"
    Then I should get voters according to "<params>"

    Examples:
      | params                                                                     |
      | address=7333160697601118486L                                               |
      | username=thor                                                              |
      | publicKey=6d013be60f6f402a56f43df88582759e2cd3c69f84fac6084d86230cfdd72c35 |
      | sort=balance:asc&address=7333160697601118486L                              |
      | sort=balance:desc&address=7333160697601118486L                             |
